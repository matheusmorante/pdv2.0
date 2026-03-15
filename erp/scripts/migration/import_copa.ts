import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const CSV_PATH = 'c:\\Users\\Rosilene\\Desktop\\pdv\\produtos_2026-03-12-12-39-40.csv';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function parseCSVLine(line: string) {
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

async function run() {
    console.log('--- INICIANDO IMPORTAÇÃO E VINCULAÇÃO (JSONB): BALCÃO COPA ---');

    if (!fs.existsSync(CSV_PATH)) {
        console.error('CSV não encontrado!');
        return;
    }

    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    
    // 1. Preparar Variações (Linhas 3-7)
    const variationsArray = [];
    const colorToId: Record<string, string> = {};

    for (let i = 2; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const colorName = cols[2]; // COR:XXXX
        const vId = Math.random().toString(36).substr(2, 9);
        
        variationsArray.push({
            id: vId,
            name: colorName,
            sku: cols[1]?.trim() || "",
            unitPrice: 299.00,
            costPrice: 179.91,
            stock: parseFloat(cols[10]) || 0,
            active: true,
            attributes: [{ name: "Cor", value: colorName.replace('COR:', '') }],
            syncWithParent: true,
            syncUnitPrice: true,
            syncCostPrice: true,
            syncDescription: true
        });
        
        colorToId[colorName.toUpperCase()] = vId;
    }

    // 2. Criar Produto Pai com Variações Acopladas
    const parentName = "Balcão para Pia de 1,20m Copa";
    console.log(`Criando produto pai com ${variationsArray.length} variações...`);
    
    const { data: newProduct, error: pError } = await supabase
        .from('products')
        .insert([{
            description: parentName,
            brand: "DACHERI",
            unit_price: 299.00,
            cost_price: 179.91,
            unit: "UN",
            active: true,
            has_variations: true,
            item_type: 'product',
            condition: 'novo',
            variations: variationsArray // JSONB
        }])
        .select()
        .single();

    if (pError) {
        console.error('Erro ao criar produto:', pError);
        return;
    }

    const parentId = String(newProduct.id);
    console.log(`Produto pai criado com ID: ${parentId}`);

    // 3. Vincular Vendas Históricas
    console.log('\nBuscando pedidos para vinculação retroativa...');
    const { data: orders, error: oError } = await supabase
        .from('orders')
        .select('id, order_data')
        .eq('deleted', false);

    if (oError) {
        console.error('Erro ao buscar pedidos:', oError);
    } else {
        let updatedCount = 0;
        for (const order of orders || []) {
            const data = order.order_data as any;
            if (!data.items) continue;

            let changed = false;
            data.items = data.items.map((item: any) => {
                const desc = (item.description || "").toUpperCase();
                
                // Filtro para identificar o Balcão Copa no histórico
                const isCopa = (desc.includes('BALCÃO') && desc.includes('COPA')) || desc.includes('VALCÃO COPA');
                
                if (isCopa && !item.productId) {
                    item.productId = parentId;
                    
                    // Tentar achar variação pela cor no histórico (descrição ou observação)
                    for (const [color, vId] of Object.entries(colorToId)) {
                        const colorValue = color.replace('COR:', '').trim();
                        if (desc.includes(colorValue) || (data.observation && data.observation.toUpperCase().includes(colorValue))) {
                            item.variationId = vId;
                            break;
                        }
                    }
                    changed = true;
                }
                return item;
            });

            if (changed) {
                const { error: upError } = await supabase
                    .from('orders')
                    .update({ order_data: data })
                    .eq('id', order.id);
                
                if (!upError) updatedCount++;
            }
        }
        console.log(`Vinculação concluída: ${updatedCount} pedidos atualizados.`);
    }

    process.exit(0);
}

run().catch(console.error);
