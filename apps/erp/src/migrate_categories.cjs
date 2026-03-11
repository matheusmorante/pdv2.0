const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrateCategories() {
    console.log("Iniciando migração de categorias...");

    // 1. Pegar todos os produtos e suas categorias antigas (em texto)
    const { data: products, error: pErr } = await supabase.from('products').select('id, category');
    if (pErr) {
        console.error("Erro ao buscar produtos:", pErr);
        return;
    }

    const uniquePaths = new Set();
    products.forEach(p => {
        if (p.category) uniquePaths.add(p.category.trim());
    });

    console.log(`Encontrados ${uniquePaths.size} tipos de categorias únicos.`);

    const groupsMap = new Map(); // name -> id
    const catsMap = new Map(); // name -> id
    const newRelations = [];

    // 2. Extrair Pais e Filhos
    for (const path of uniquePaths) {
        let parentName = '';
        let childName = '';

        if (path.includes('>>')) {
            const parts = path.split('>>');
            parentName = parts[0].trim().toUpperCase();
            childName = parts[1].trim().toUpperCase();
        } else {
            // Se só tiver um valor, nós tratamos como Filho sem Pai, ou como Pai se for genérico?
            // "O pai é só para referenciar." A maioria que vem sem >> vamos assumir que é só "Produto" ou genérico.
            childName = path.trim().toUpperCase();
        }

        if (parentName && !groupsMap.has(parentName)) {
            groupsMap.set(parentName, null); // Will populate ID
        }
        if (childName && !catsMap.has(childName)) {
            catsMap.set(childName, null);
        }
    }

    console.log(`Pares encontrados: ${groupsMap.size} Pais, ${catsMap.size} Filhos`);

    // 3. Inserir Pais
    for (const gName of Array.from(groupsMap.keys())) {
        const { data, error } = await supabase.from('category_groups').insert({ name: gName, active: true }).select('id').single();
        if (error) {
            // Already exists?
            if (error.code === '23505') {
                const { data: ex } = await supabase.from('category_groups').select('id').eq('name', gName).single();
                groupsMap.set(gName, ex.id);
            } else {
                console.error("Erro insert pai:", error);
            }
        } else {
            groupsMap.set(gName, data.id);
        }
    }

    // 4. Inserir Filhos
    for (const cName of Array.from(catsMap.keys())) {
        const { data, error } = await supabase.from('categories').insert({ name: cName, active: true }).select('id').single();
        if (error) {
            if (error.code === '23505') {
                const { data: ex } = await supabase.from('categories').select('id').eq('name', cName).single();
                catsMap.set(cName, ex.id);
            } else {
                console.error("Erro insert filho:", error);
            }
        } else {
            catsMap.set(cName, data.id);
        }
    }

    // 5. Associar Pais e Filhos
    for (const path of uniquePaths) {
        if (path.includes('>>')) {
            const parts = path.split('>>');
            const parentName = parts[0].trim().toUpperCase();
            const childName = parts[1].trim().toUpperCase();

            const pId = groupsMap.get(parentName);
            const cId = catsMap.get(childName);

            if (pId && cId) {
                // Check if link exists
                const { data } = await supabase.from('category_group_links').select('*').eq('group_id', pId).eq('category_id', cId);
                if (!data || data.length === 0) {
                    await supabase.from('category_group_links').insert({ group_id: pId, category_id: cId });
                }
            }
        }
    }

    // 6. Atualizar a tabela produto com as novas subcategorias (Muitos para Muitos)
    console.log("Criando relacionamentos Produto <-> Subcategoria (Filho)");
    for (const p of products) {
        if (!p.category) continue;

        let childName = p.category;
        if (p.category.includes('>>')) {
            childName = p.category.split('>>')[1].trim().toUpperCase();
        } else {
            childName = p.category.trim().toUpperCase();
        }

        const cId = catsMap.get(childName);
        if (cId) {
            const { error } = await supabase.from('product_categories').insert({ product_id: p.id, category_id: cId });
            if (error && error.code !== '23505') { // Ignore duplicate key
                console.error("Erro ao vincular produto à categoria:", error.message);
            }
        }
    }

    console.log("Migração de dados preexistentes concluída com sucesso!");
}

migrateCategories().catch(console.error);
