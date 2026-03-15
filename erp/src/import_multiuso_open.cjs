const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CSV_PATH = 'c:\\Users\\mathe\\OneDrive\\Área de Trabalho\\projetos\\moveismorantehub\\multiusoopen.csv';

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ';' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
}

async function startImport() {
    console.log('--- Iniciando Importação do Multiuso OPEN ---');
    if (!fs.existsSync(CSV_PATH)) {
        console.error('Arquivo CSV não encontrado em:', CSV_PATH);
        return;
    }

    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = content.split('\n');
    const header = parseCSVLine(lines[0]);

    const h = (name) => header.indexOf(name);
    const idx = {
        code: h('Código'),
        desc: h('Descrição'),
        unit: h('Unidade'),
        price: h('Preço'),
        cost: h('Preço de custo'),
        stock: h('Estoque'),
        brand: h('Marca'),
        cat: h('Categoria do produto'),
        situation: h('Situação'),
        width: h('Largura do produto'),
        height: h('Altura do Produto'),
        depth: h('Profundidade do produto')
    };

    const line3 = lines[1].trim();
    if (!line3) return;
    const cols = parseCSVLine(line3);

    const getVal = (colIdx) => (colIdx !== -1 && cols[colIdx]) ? cols[colIdx].trim() : '';

    const product = {
        description: getVal(idx.desc),
        unit: getVal(idx.unit) || 'UN',
        unit_price: parseFloat(getVal(idx.price).replace('.', '').replace(',', '.')) || 0,
        cost_price: parseFloat(getVal(idx.cost).replace('.', '').replace(',', '.')) || 0,
        stock: parseFloat(getVal(idx.stock).replace('.', '').replace(',', '.')) || 0,
        brand: getVal(idx.brand),
        category: getVal(idx.cat),
        active: getVal(idx.situation) === 'Ativo',
        width: parseFloat(getVal(idx.width).replace(',', '.')) || 0,
        height: parseFloat(getVal(idx.height).replace(',', '.')) || 0,
        depth: parseFloat(getVal(idx.depth).replace(',', '.')) || 0,
        item_type: 'product',
        updated_at: new Date().toISOString()
    };

    console.log('Dados do produto:', product);

    // Verificar duplicado
    const { data: existing } = await supabase.from('products').select('id').eq('description', product.description).eq('deleted', false);
    if (existing && existing.length > 0) {
        console.log('Produto já existe. ID:', existing[0].id);
    } else {
        const { data, error } = await supabase.from('products').insert([product]).select('id').single();
        if (error) {
            console.error('Erro ao inserir:', error.message);
        } else {
            console.log('Inserido com sucesso! ID:', data.id);
            // Link category
            if (product.category.includes('ESTANTE')) {
                const { data: cat } = await supabase.from('categories').select('id').ilike('name', 'ESTANTE').single();
                if (cat) await supabase.from('product_categories').insert({ product_id: data.id, category_id: cat.id });
            }
        }
    }
    console.log('Concluído.');
    process.exit(0);
}

startImport().catch(err => {
    console.error(err);
    process.exit(1);
});
