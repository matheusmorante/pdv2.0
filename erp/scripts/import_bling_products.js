import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const PRODUCTS_CSV = 'c:\\Users\\Rosilene\\Documents\\produtosbling\\produtos.csv';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function parsePrice(val) {
    if (!val) return 0;
    // Bling format: 3.599,00 or 179,00
    return parseFloat(String(val).replace(/\./g, '').replace(',', '.')) || 0;
}

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

const generateId = () => Math.random().toString(36).substr(2, 9);

async function run() {
    console.log('--- STARTING BLING PRODUCTS IMPORT ---');

    if (!fs.existsSync(PRODUCTS_CSV)) {
        console.error(`File not found: ${PRODUCTS_CSV}`);
        return;
    }

    const content = fs.readFileSync(PRODUCTS_CSV, 'utf-8');
    const lines = content.split('\n');
    const header = parseCSVLine(lines[0]);
    
    const h = (name) => header.indexOf(name);
    const idx = {
        id: h('ID'),
        code: h('Código'),
        desc: h('Descrição'),
        unit: h('Unidade'),
        price: h('Preço'),
        cost: h('Preço de custo'),
        situation: h('Situação'),
        stock: h('Estoque'),
        parentCode: h('Código Pai'),
        brand: h('Marca'),
        category: h('Categoria do produto'),
        width: h('Largura do Produto'),
        height: h('Altura do Produto'),
        depth: h('Profundidade do produto'),
        condition: h('Condição do produto')
    };

    const parents = new Map(); // code -> data
    const variations = []; // list of variations to attach later

    console.log(`Processing ${lines.length - 1} lines...`);

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = parseCSVLine(line);
        
        const code = (cols[idx.code] || '').trim();
        const parentCode = (cols[idx.parentCode] || '').trim();
        const description = (cols[idx.desc] || '').trim();
        
        const itemInfo = {
            code,
            description,
            unit: cols[idx.unit] || 'UN',
            unit_price: parsePrice(cols[idx.price]),
            cost_price: parsePrice(cols[idx.cost]),
            stock: parsePrice(cols[idx.stock]),
            active: (cols[idx.situation] || '').toLowerCase().includes('ativo'),
            brand: cols[idx.brand] || '',
            category: cols[idx.category] || '',
            width: parseFloat(cols[idx.width]) || 0,
            height: parseFloat(cols[idx.height]) || 0,
            depth: parseFloat(cols[idx.depth]) || 0,
            condition: (cols[idx.condition] || 'novo').toLowerCase(),
            has_variations: false,
            variations: [],
            updated_at: new Date().toISOString()
        };

        if (parentCode) {
            variations.push({ parentCode, ...itemInfo });
        } else {
            parents.set(code, itemInfo);
        }
    }

    console.log(`Grouped ${parents.size} parents and ${variations.size || variations.length} variations.`);

    // Attach variations to parents
    for (const v of variations) {
        const parent = parents.get(v.parentCode);
        if (parent) {
            parent.has_variations = true;
            parent.variations.push({
                id: generateId(),
                name: v.description,
                sku: v.code,
                stock: v.stock,
                unitPrice: v.unit_price,
                costPrice: v.cost_price
            });
        }
    }

    // Fetch existing descriptions to avoid duplicates
    console.log('Fetching existing products...');
    const { data: existing } = await supabase.from('products').select('description, id');
    const existingMap = new Map();
    (existing || []).forEach(p => existingMap.set(p.description.toLowerCase().trim(), p.id));

    let successCount = 0;
    let updateCount = 0;

    console.log('Sending data to database...');
    for (const [code, p] of parents.entries()) {
        try {
            const existingId = existingMap.get(p.description.toLowerCase().trim());
            
            if (existingId) {
                const { error } = await supabase.from('products').update(p).eq('id', existingId);
                if (error) throw error;
                updateCount++;
            } else {
                const { error } = await supabase.from('products').insert([p]);
                if (error) throw error;
                successCount++;
            }

            if ((successCount + updateCount) % 50 === 0) {
                console.log(`Progress: ${successCount + updateCount} processed...`);
            }
        } catch (err) {
            console.error(`Error processing product ${p.description}:`, err.message);
        }
    }

    console.log(`--- FINISHED ---`);
    console.log(`Created: ${successCount}`);
    console.log(`Updated: ${updateCount}`);
}

run();
