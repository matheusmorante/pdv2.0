const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function refineCategories() {
    console.log("Iniciando refinamento de categorias...");

    // 1. Garantir que os grupos e categorias existam
    const setupCategory = async (groupName, catName) => {
        let { data: group } = await supabase.from('category_groups').select('id').eq('name', groupName).single();
        if (!group) {
            console.log(`Criando grupo: ${groupName}`);
            const { data, error } = await supabase.from('category_groups').insert({ name: groupName, active: true }).select('id').single();
            if (error) throw error;
            group = data;
        }

        let { data: category } = await supabase.from('categories').select('id').eq('name', catName).single();
        if (!category) {
            console.log(`Criando categoria: ${catName}`);
            const { data, error } = await supabase.from('categories').insert({ name: catName, active: true }).select('id').single();
            if (error) throw error;
            category = data;
        }

        // Linkar
        const { data: link } = await supabase.from('category_group_links').select('*').eq('group_id', group.id).eq('category_id', category.id).single();
        if (!link) {
            console.log(`Linkando ${groupName} -> ${catName}`);
            await supabase.from('category_group_links').insert({ group_id: group.id, category_id: category.id });
        }

        return { groupId: group.id, catId: category.id };
    };

    const sofaConfig = await setupCategory('SALA DE ESTAR', 'SOFÁS');
    const mesaConfig = await setupCategory('SALA DE JANTAR', 'MESA');

    // 2. Buscar produtos
    const { data: products, error } = await supabase.from('products').select('id, description, category');
    if (error) {
        console.error("Erro ao buscar produtos:", error);
        return;
    }

    console.log(`Analisando ${products.length} produtos...`);

    for (const p of products) {
        let currentCategory = p.category || '';

        // Remover "SALVADOS" da categoria
        if (currentCategory.toUpperCase().includes('SALVADOS')) {
            const oldCat = currentCategory;
            // Remove "SALVADOS >> " (com ou sem espaços extras) ou apenas "SALVADOS"
            currentCategory = currentCategory
                .replace(/SALVADOS\s*>>\s*/gi, '')
                .replace(/SALVADOS/gi, '')
                .trim();

            // Se sobrar apenas ">>", limpa
            if (currentCategory === '>>') currentCategory = '';

            if (oldCat !== currentCategory) {
                console.log(`Removendo SALVADOS: [${oldCat}] -> [${currentCategory}]`);
                await supabase.from('products').update({ category: currentCategory }).eq('id', p.id);
            }
        }

        const desc = (p.description || '').toUpperCase();
        const currentCatNorm = currentCategory.toUpperCase();
        let targetCategory = null;
        let targetCatId = null;

        // SOFÁ / ESTOFADO
        if (desc.includes('SOFÁ') || desc.includes('SOFA') || desc.includes('ESTOF') || currentCatNorm.includes('SOFÁ') || currentCatNorm.includes('SOFA')) {
            targetCategory = 'SALA DE ESTAR >> SOFÁS';
            targetCatId = sofaConfig.catId;
        }
        // MESA (sem cadeiras)
        else if (desc.includes('MESA') || currentCatNorm.includes('MESA')) {
            const hasChairs = desc.includes('CADEIRA') || desc.includes('CAD') || desc.includes('MDFVD') || desc.includes('CD') || desc.includes('CJ') || desc.includes('CONJUNTO') || desc.includes('C/4') || desc.includes('C/6') || desc.includes('6CD') || desc.includes('4CD');
            const isOtherMesa = desc.includes('CENTRO') || desc.includes('CABECEIRA') || desc.includes('CRIADO') || desc.includes('ESCRITÓRIO') || desc.includes('OFFICE') || desc.includes('BASE') ||
                currentCatNorm.includes('CENTRO') || currentCatNorm.includes('CABECEIRA') || currentCatNorm.includes('CRIADO') || currentCatNorm.includes('ESCRITÓRIO') || currentCatNorm.includes('OFFICE');

            if (!hasChairs && !isOtherMesa) {
                targetCategory = 'SALA DE JANTAR >> MESA';
                targetCatId = mesaConfig.catId;
            }
        }

        // Se o targetCategory for diferente da categoria atual (que pode ter sido limpa de SALVADOS)
        if (targetCategory && (currentCategory !== targetCategory)) {
            console.log(`Atualizando [${p.description}] : [${p.category}] -> ${targetCategory}`);

            // Update legacy string
            const { error: updErr } = await supabase.from('products').update({ category: targetCategory }).eq('id', p.id);
            if (updErr) console.error("Erro update string:", updErr);

            // Update product_categories relation
            const { error: relErr } = await supabase.from('product_categories').upsert({ product_id: p.id, category_id: targetCatId }, { onConflict: 'product_id,category_id' });
            if (relErr) {
                console.error(`Erro ao vincular ${p.description}:`, relErr.message);
            }
        } else if (p.category === 'SALA DE JANTAR >> MESA' && !targetCategory) {
            // Se já está como MESA mas não deveria estar (com base nas novas exclusões), limpa
            console.log(`LIMPANDO (Miscategorizado) [${p.description}]`);
            await supabase.from('products').update({ category: '' }).eq('id', p.id);
            await supabase.from('product_categories').delete().eq('product_id', p.id).eq('category_id', mesaConfig.catId);
        }
    }

    console.log("Refinamento concluído!");
}

refineCategories().catch(console.error);
