const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

fs.writeFileSync('script_started.txt', 'Started at ' + new Date().toISOString());

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MOPAR_CSV = 'c:\\Users\\mathe\\OneDrive\\Área de Trabalho\\projetos\\moveismorantehub\\mopar.csv';

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ';' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, '').trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim().replace(/^"|"$/g, '').trim());
    return result;
}

async function getOrCreateCategory(categoryPath) {
    if (!categoryPath) return null;

    let parentName = '';
    let childName = '';

    if (categoryPath.includes('>>')) {
        const parts = categoryPath.split('>>');
        parentName = parts[0].trim().toUpperCase();
        childName = parts[1].trim().toUpperCase();
    } else {
        childName = categoryPath.trim().toUpperCase();
    }

    let parentId = null;
    if (parentName) {
        const { data: pData } = await supabase.from('category_groups').select('id').eq('name', parentName).limit(1);
        if (pData && pData.length > 0) {
            parentId = pData[0].id;
        } else {
            const { data: newP } = await supabase.from('category_groups').insert({ name: parentName, active: true }).select('id').single();
            parentId = newP.id;
        }
    }

    let childId = null;
    const { data: cData } = await supabase.from('categories').select('id').eq('name', childName).limit(1);
    if (cData && cData.length > 0) {
        childId = cData[0].id;
    } else {
        const { data: newC } = await supabase.from('categories').insert({ name: childName, active: true }).select('id').single();
        childId = newC.id;
    }

    if (parentId && childId) {
        const { data: link } = await supabase.from('category_group_links').select('*').eq('group_id', parentId).eq('category_id', childId).limit(1);
        if (!link || link.length === 0) {
            await supabase.from('category_group_links').insert({ group_id: parentId, category_id: childId });
        }
    }

    return childId;
}

async function importMopar() {
    console.log('--- Iniciando Importação Mopar v2 ---');
    if (!fs.existsSync(MOPAR_CSV)) {
        console.error('Arquivo mopar.csv não encontrado.');
        return;
    }

    const content = fs.readFileSync(MOPAR_CSV, 'utf-8');
    const lines = content.split('\n');
    const header = parseCSVLine(lines[0]);

    const h = (name) => header.indexOf(name);
    const idx = {
        blingId: h('ID'),
        code: h('Código'),
        desc: h('Descrição'),
        price: h('Preço'),
        cost: h('Preço de custo'),
        stock: h('Estoque'),
        parent: h('Código Pai'),
        brand: h('Marca'),
        cat: h('Categoria do produto'),
        unit: h('Unidade')
    };

    const rawItems = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = parseCSVLine(line);
        if (cols.length < 5) continue;

        const getVal = (colId) => (colId !== -1 && cols[colId]) ? cols[colId] : '';

        rawItems.push({
            blingId: getVal(idx.blingId),
            code: getVal(idx.code),
            description: getVal(idx.desc),
            price: parseFloat(getVal(idx.price).replace('.', '').replace(',', '.')) || 0,
            cost: parseFloat(getVal(idx.cost).replace('.', '').replace(',', '.')) || 0,
            stock: parseFloat(getVal(idx.stock).replace('.', '').replace(',', '.')) || 0,
            parentCode: getVal(idx.parent),
            brand: getVal(idx.brand) || 'MOPAR',
            category: getVal(idx.cat),
            unit: getVal(idx.unit) || 'UN'
        });
    }

    console.log(`Lidos ${rawItems.length} registros no CSV.`);

    const productsMap = new Map(); // Main description -> { data, variations: [] }
    let lastMainProduct = null;

    for (const item of rawItems) {
        const isVariationByName = item.description.startsWith('COR:');
        const hasParentCode = item.parentCode && item.parentCode !== "0" && item.parentCode !== "";

        if (!isVariationByName && !hasParentCode) {
            // This is a Main Product
            lastMainProduct = item.description;
            productsMap.set(lastMainProduct, {
                data: item,
                variations: []
            });
        } else {
            // This is a Variation
            let targetMain = null;
            if (hasParentCode) {
                // Try to find by code
                for (const p of productsMap.values()) {
                    if (p.data.code === item.parentCode || p.data.blingId === item.parentCode) {
                        targetMain = p.data.description;
                        break;
                    }
                }
            }
            
            // Fallback to heuristic: sequential
            if (!targetMain) {
                targetMain = lastMainProduct;
            }

            if (targetMain && productsMap.has(targetMain)) {
                productsMap.get(targetMain).variations.push(item);
            } else {
                console.warn(`Variação órfã encontrada: ${item.description} (ID: ${item.blingId})`);
                // Insert as main as fallback
                productsMap.set(item.description, { data: item, variations: [] });
            }
        }
    }

    console.log(`Processados ${productsMap.size} produtos principais.`);

    for (const [desc, productInfo] of productsMap.entries()) {
        const main = productInfo.data;
        const vars = productInfo.variations;

        console.log(`> [START] ${desc} (${vars.length} variações)`);

        const catId = await getOrCreateCategory(main.category);
        console.log(`  Categoria ID: ${catId}`);

        const productData = {
            description: main.description,
            brand: main.brand,
            category: main.category,
            unit_price: main.price,
            cost_price: main.cost,
            stock: main.stock,
            code: main.code || main.blingId,
            unit: main.unit,
            active: true,
            deleted: false,
            item_type: 'product',
            has_variations: vars.length > 0,
            updated_at: new Date().toISOString()
        };

        const { data: existing, error: fetchErr } = await supabase.from('products').select('id').eq('description', main.description).eq('deleted', false).limit(1);
        if (fetchErr) console.error('  Fetch error:', fetchErr.message);
        
        let productId;
        if (existing && existing.length > 0) {
            productId = existing[0].id;
            console.log(`  Atualizando ID: ${productId}`);
            const { error: upErr } = await supabase.from('products').update(productData).eq('id', productId);
            if (upErr) console.error('  Update error:', upErr.message);
        } else {
            console.log(`  Inserindo novo produto...`);
            const { data, error: insErr } = await supabase.from('products').insert([productData]).select('id').single();
            if (insErr) {
                console.error(`  Erro ao inserir ${main.description}:`, insErr.message);
                continue;
            }
            productId = data.id;
        }

        // Link category
        if (catId) {
            console.log(`  Vinculando categoria...`);
            await supabase.from('product_categories').upsert({ product_id: productId, category_id: catId }, { onConflict: 'product_id,category_id' });
        }

        // Variations
        if (vars.length > 0) {
            console.log(`  Sincronizando ${vars.length} variações...`);
            const mappedVariations = vars.map(v => ({
                id: v.blingId,
                name: v.description.replace('COR:', '').trim(),
                sku: v.code || v.blingId,
                unitPrice: v.price,
                costPrice: v.cost,
                stock: v.stock,
                active: true,
                syncUnitPrice: true,
                syncCostPrice: true,
                syncDescription: true
            }));

            const { error: varErr } = await supabase.from('products').update({ variations: mappedVariations }).eq('id', productId);
            if (varErr) console.error('  Variation update error:', varErr.message);
        }
        console.log(`  [DONE] ${desc}`);
    }

    console.log('--- Importação Mopar v2 Concluída ---');
    process.exit(0);
}

importMopar().catch(err => {
    console.error(err);
    process.exit(1);
});
