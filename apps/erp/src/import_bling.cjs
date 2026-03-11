
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CSV_PATH = 'c:\\Users\\Rosilene\\Desktop\\pdv\\pdv\\src\\produtos_2026-03-09-15-28-16.csv';

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
    console.log('--- Iniciando Processamento ---');
    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = content.split('\n');
    const header = parseCSVLine(lines[0]);

    console.log('Colunas encontradas:', header.join(' | '));

    const h = (name) => {
        const idx = header.indexOf(name);
        if (idx === -1) {
            // Tentativa de busca aproximada caso haja espaços ou caracteres invisíveis
            return header.findIndex(col => col.includes(name));
        }
        return idx;
    };

    const idx = {
        id: h('ID'),
        code: h('Código'),
        desc: h('Descrição'),
        unit: h('Unidade'),
        price: h('Preço'),
        cost: h('Preço de custo'),
        stock: h('Estoque'),
        minStock: h('Estoque mínimo'),
        parent: h('Código Pai'),
        brand: h('Marca'),
        cat: h('Categoria do produto'),
        situation: h('Situação')
    };

    const rawProducts = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = parseCSVLine(line);
        if (cols.length < 5) continue;

        const getVal = (colIdx) => (colIdx !== -1 && cols[colIdx]) ? cols[colIdx].trim() : '';

        rawProducts.push({
            code: getVal(idx.code),
            description: getVal(idx.desc),
            unit: getVal(idx.unit),
            price: parseFloat(getVal(idx.price).replace('.', '').replace(',', '.')) || 0,
            cost: parseFloat(getVal(idx.cost).replace('.', '').replace(',', '.')) || 0,
            stock: parseFloat(getVal(idx.stock).replace('.', '').replace(',', '.')) || 0,
            minStock: parseFloat(getVal(idx.minStock).replace('.', '').replace(',', '.')) || 0,
            parentCode: getVal(idx.parent),
            brand: getVal(idx.brand),
            category: getVal(idx.cat),
            active: getVal(idx.situation) === 'Ativo'
        });
    }

    console.log(`Lidos ${rawProducts.length} registros. Agrupando pais e filhos...`);

    const finalProductsMap = new Map();

    // Identificar pais e produtos simples primeiro
    rawProducts.forEach(p => {
        if (!p.parentCode) {
            finalProductsMap.set(p.code, {
                ...p,
                has_variations: false,
                variations: []
            });
        }
    });

    // Anexar variações (filhos)
    rawProducts.forEach(p => {
        if (p.parentCode) {
            const parent = finalProductsMap.get(p.parentCode);
            if (parent) {
                parent.has_variations = true;
                parent.variations.push({
                    sku: p.code,
                    name: p.description,
                    stock: p.stock,
                    unitPrice: p.price,
                    costPrice: p.cost,
                    active: p.active,
                    attributes: []
                });
            } else {
                // Se o pai não foi encontrado, trata como produto simples
                finalProductsMap.set(p.code, {
                    ...p,
                    has_variations: false,
                    variations: []
                });
            }
        }
    });

    const productsToInsert = Array.from(finalProductsMap.values()).map(p => ({
        code: p.code,
        description: p.description,
        brand: p.brand,
        category: p.category,
        unit_price: p.price,
        cost_price: p.cost,
        stock: p.stock,
        min_stock: p.minStock,
        unit: p.unit || 'un',
        active: p.active,
        has_variations: p.has_variations,
        variations: p.variations,
        item_type: 'product',
        updated_at: new Date().toISOString()
    }));

    console.log(`Processados ${productsToInsert.length} produtos principais.`);
    console.log('Iniciando upload para o banco...');

    const chunkSize = 50;
    for (let i = 0; i < productsToInsert.length; i += chunkSize) {
        const chunk = productsToInsert.slice(i, i + chunkSize);
        const { error } = await supabase.from('products').insert(chunk);
        if (error) {
            console.error(`Erro no lote ${Math.floor(i / chunkSize) + 1}:`, error.message);
        } else {
            process.stdout.write('.');
        }
    }

    console.log('\nImportação concluída com sucesso!');
}

startImport().catch(err => {
    console.error('Erro fatal:', err);
});
