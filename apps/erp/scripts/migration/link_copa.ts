import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const PRODUCT_ID = '397';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log('--- INICIANDO VINCULAÇÃO RETROATIVA: BALCÃO COPA ---');

    // 1. Buscar o produto e suas variações para obter os IDs reais
    const { data: product, error: pError } = await supabase
        .from('products')
        .select('*')
        .eq('id', PRODUCT_ID)
        .single();

    if (pError || !product) {
        console.error('Erro ao buscar produto 397:', pError);
        return;
    }

    const variations = product.variations || [];
    const colorToId: Record<string, string> = {};
    variations.forEach((v: any) => {
        colorToId[v.name.toUpperCase()] = v.id;
    });

    console.log('Variações mapeadas:', Object.keys(colorToId));

    // 2. Buscar pedidos
    const { data: orders, error: oError } = await supabase
        .from('orders')
        .select('id, order_data');

    if (oError) {
        console.error('Erro ao buscar pedidos:', oError);
        return;
    }

    console.log(`Analisando ${orders?.length || 0} pedidos...`);
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
                item.productId = PRODUCT_ID;
                
                // Tentar achar variação pela cor no histórico
                for (const [color, vId] of Object.entries(colorToId)) {
                    const colorValue = color.replace('COR:', '').trim();
                    if (desc.includes(colorValue) || (data.observation && data.observation.toUpperCase().includes(colorValue))) {
                        item.variationId = vId;
                        console.log(`  -> Match encontrado no pedido ${order.id}: ${desc} -> ${color}`);
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
            
            if (!upError) {
                updatedCount++;
            } else {
                console.error(`Erro ao atualizar pedido ${order.id}:`, upError);
            }
        }
    }

    console.log(`\nPROCESSO CONCLUÍDO: ${updatedCount} pedidos vinculados ao Balcão Copa.`);
    process.exit(0);
}

run().catch(console.error);
