const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const LOG_FILE = 'import_log.txt';
fs.writeFileSync(LOG_FILE, 'Log iniciado em ' + new Date().toISOString() + '\n');
function log(msg) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CSV_PATH = 'C:/Users/mathe/OneDrive/Área de Trabalho/projetos/moveismorantehub/dacheri - Copia.csv';

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

function mapCategory(blingCat, description) {
    const cat = blingCat.toUpperCase();
    const desc = description.toUpperCase();

    // Prioridade por palavra-chave na descrição se a categoria do bling for genérica
    if (desc.includes('BALCÃO')) return { group: 'COZINHA', name: 'BALCÃO' };
    if (desc.includes('PANELEIRO')) return { group: 'COZINHA', name: 'PANELEIRO' };
    if (desc.includes('AÉREO')) return { group: 'COZINHA', name: 'AÉREO' };
    if (desc.includes('KIT')) return { group: 'COZINHA', name: 'KIT' };
    if (desc.includes('TORRE') || desc.includes('FORNO')) return { group: 'COZINHA', name: 'TORRE QUENTE' };
    if (desc.includes('TÁBUA')) return { group: 'LAVANDERIA', name: 'TÁBUA DE PASSAR' };
    if (desc.includes('MULTIUSO')) return { group: 'VÁRIOS AMBIENTES', name: 'MULTIUSO' };
    if (desc.includes('TAMPO')) return { group: 'COZINHA', name: 'TAMPO' };

    // Fallback por categoria do Bling
    if (cat.includes('BALCÃO')) return { group: 'COZINHA', name: 'BALCÃO' };
    if (cat.includes('COZINHA')) return { group: 'COZINHA', name: 'DIVERSOS' };
    if (cat.includes('QUARTO')) return { group: 'QUARTO', name: 'DIVERSOS' };
    
    return { group: 'OUTROS', name: 'DIVERSOS' };
}

async function getOrCreateCategory(mapping) {
    let groupId = null;
    const { data: gData } = await supabase.from('category_groups').select('id').eq('name', mapping.group).limit(1);
    if (gData && gData.length > 0) {
        groupId = gData[0].id;
    } else {
        const { data: newG } = await supabase.from('category_groups').insert({ name: mapping.group, active: true }).select('id').single();
        groupId = newG.id;
    }

    let catId = null;
    const { data: cData } = await supabase.from('categories').select('id').eq('name', mapping.name).limit(1);
    if (cData && cData.length > 0) {
        catId = cData[0].id;
    } else {
        const { data: newC } = await supabase.from('categories').insert({ name: mapping.name, active: true }).select('id').single();
        catId = newC.id;
    }

    if (groupId && catId) {
        const { data: link } = await supabase.from('category_group_links').select('*').eq('group_id', groupId).eq('category_id', catId).limit(1);
        if (!link || link.length === 0) {
            await supabase.from('category_group_links').insert({ group_id: groupId, category_id: catId });
        }
    }

    return catId;
}

async function getSupplierId(name) {
    const { data } = await supabase.from('people').select('id').ilike('full_name', `%${name}%`).eq('person_type', 'suppliers').limit(1);
    return data && data.length > 0 ? data[0].id : null;
}

async function importDacheri() {
    log('--- Iniciando Importação Dacheri ---');
    
    let content;
    try {
        content = fs.readFileSync(CSV_PATH, 'latin1');
    } catch (e) {
        log('Erro ao ler arquivo: ' + e.message);
        return;
    }

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
        unit: h('Unidade'),
        supplier: h('Fornecedor')
    };

    const dacheriId = await getSupplierId('DACHERI');
    const movelipeId = await getSupplierId('MOVELIPE');

    const rawItems = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = parseCSVLine(line);
        if (cols.length < 5) continue;

        const getVal = (colId) => (colId !== -1 && cols[colId]) ? cols[colId] : '';

        const supplierName = getVal(idx.supplier).toUpperCase();
        let supplierId = dacheriId;
        if (supplierName.includes('MOVELIPE')) supplierId = movelipeId;

        rawItems.push({
            blingId: getVal(idx.blingId),
            code: getVal(idx.code).replace('\t', '').trim(),
            description: getVal(idx.desc),
            price: parseFloat(getVal(idx.price).replace('.', '').replace(',', '.')) || 0,
            cost: parseFloat(getVal(idx.cost).replace('.', '').replace(',', '.')) || 0,
            stock: parseFloat(getVal(idx.stock).replace('.', '').replace(',', '.')) || 0,
            parentCode: getVal(idx.parent).replace('\t', '').trim(),
            brand: 'Dacheri',
            category: getVal(idx.cat),
            unit: getVal(idx.unit) || 'UN',
            supplierId: supplierId
        });
    }

    log(`Lidos ${rawItems.length} registros.`);

    const productsMap = new Map();
    let lastMainProduct = null;

    for (const item of rawItems) {
        const isVariationByName = item.description.startsWith('COR:');
        const hasParentCode = item.parentCode && item.parentCode !== "0" && item.parentCode !== "";

        if (!isVariationByName && !hasParentCode) {
            lastMainProduct = item.description;
            productsMap.set(lastMainProduct, {
                data: item,
                variations: []
            });
        } else {
            let targetMain = null;
            if (hasParentCode) {
                for (const p of productsMap.values()) {
                    if (p.data.code === item.parentCode || p.data.blingId === item.parentCode) {
                        targetMain = p.data.description;
                        break;
                    }
                }
            }
            if (!targetMain) targetMain = lastMainProduct;

            if (targetMain && productsMap.has(targetMain)) {
                productsMap.get(targetMain).variations.push(item);
            } else {
                log(`Variação órfã: ${item.description}`);
                productsMap.set(item.description, { data: item, variations: [] });
            }
        }
    }

    for (const [desc, productInfo] of productsMap.entries()) {
        const main = productInfo.data;
        const vars = productInfo.variations;

        log(`> Processando: ${desc}`);

        const mapping = mapCategory(main.category, main.description);
        const catId = await getOrCreateCategory(mapping);

        const productData = {
            description: main.description,
            brand: 'Dacheri',
            category: `${mapping.group} >> ${mapping.name}`,
            unit_price: main.price,
            cost_price: main.cost,
            stock: main.stock,
            code: main.code || main.blingId,
            unit: main.unit,
            supplier_id: main.supplierId,
            active: true,
            deleted: false,
            item_type: 'product',
            has_variations: vars.length > 0,
            updated_at: new Date().toISOString()
        };

        const { data: existing } = await supabase.from('products').select('id').eq('description', main.description).eq('deleted', false).limit(1);
        
        let productId;
        if (existing && existing.length > 0) {
            productId = existing[0].id;
            await supabase.from('products').update(productData).eq('id', productId);
        } else {
            const { data, error } = await supabase.from('products').insert([productData]).select('id').single();
            if (error) {
                log(`Erro ao inserir ${main.description}: ` + error.message);
                continue;
            }
            productId = data.id;
        }

        if (catId) {
            await supabase.from('product_categories').upsert({ product_id: productId, category_id: catId }, { onConflict: 'product_id,category_id' });
        }

        if (vars.length > 0) {
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
            await supabase.from('products').update({ variations: mappedVariations }).eq('id', productId);
        }
    }

    log('--- Concluído ---');
}

importDacheri().catch(console.error);
