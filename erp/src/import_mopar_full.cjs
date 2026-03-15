const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

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

async function importMopar() {
    console.log('--- Iniciando Importação Mopar ---');
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
        cat: h('Categoria do produto')
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
            category: getVal(idx.cat)
        });
    }

    console.log(`Lidos ${rawItems.length} registros.`);

    // First pass: Create main products
    const mainItems = rawItems.filter(item => !item.parentCode || item.parentCode === "0" || item.parentCode === "");
    const variations = rawItems.filter(item => item.parentCode && item.parentCode !== "0" && item.parentCode !== "");

    console.log(`Produtos principais: ${mainItems.length}, Variações: ${variations.length}`);

    for (const main of mainItems) {
        // Check if already exists
        const { data: existing } = await supabase.from('products').select('id, variations').eq('description', main.description).eq('deleted', false).limit(1);
        
        let productId;
        const productData = {
            description: main.description,
            brand: main.brand,
            category: main.category,
            unit_price: main.price,
            cost_price: main.cost,
            stock: main.stock,
            code: main.code || main.blingId,
            active: true,
            deleted: false,
            item_type: 'product',
            has_variations: true, // We'll assume yes if it's Mopar
            updated_at: new Date().toISOString()
        };

        if (existing && existing.length > 0) {
            console.log(`Atualizando ${main.description}...`);
            productId = existing[0].id;
            await supabase.from('products').update(productData).eq('id', productId);
        } else {
            console.log(`Inserindo ${main.description}...`);
            const { data, error } = await supabase.from('products').insert([productData]).select('id').single();
            if (error) {
                console.error(`Erro ao inserir ${main.description}:`, error.message);
                continue;
            }
            productId = data.id;
        }

        // Attach variations
        const itemVariations = variations.filter(v => v.parentCode === main.code);
        if (itemVariations.length > 0) {
            const mappedVariations = itemVariations.map(iv => ({
                id: iv.blingId,
                name: iv.description,
                sku: iv.code || iv.blingId,
                unitPrice: iv.price,
                costPrice: iv.cost,
                stock: iv.stock,
                active: true,
                attributes: []
            }));

            await supabase.from('products').update({ variations: mappedVariations }).eq('id', productId);
            console.log(`Variações vinculadas para ${main.description}: ${mappedVariations.length}`);
        }
    }

    console.log('--- Importação Mopar Concluída ---');
    process.exit(0);
}

importMopar().catch(err => {
    console.error(err);
    process.exit(1);
});
