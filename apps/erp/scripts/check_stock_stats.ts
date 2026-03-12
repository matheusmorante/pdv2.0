import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkStockProcessed() {
    console.log('--- ANALISANDO STOCKPROCESSED NOS PEDIDOS BLING ---');
    
    let hasMore = true;
    let offset = 0;
    const pageSize = 1000;
    const stats = {
        fulfilled_with_stock: 0,
        fulfilled_without_stock: 0,
        cancelled_with_stock: 0,
        cancelled_without_stock: 0
    };

    while (hasMore) {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('order_data')
            .range(offset, offset + pageSize - 1);

        if (error || !orders || orders.length === 0) break;

        for (const order of orders) {
            const od = order.order_data;
            if (od?.marketingOrigin === 'Bling') {
                const status = od.status;
                const sp = od.stockProcessed === true;
                
                if (status === 'fulfilled') {
                    if (sp) stats.fulfilled_with_stock++;
                    else stats.fulfilled_without_stock++;
                } else if (status === 'cancelled') {
                    if (sp) stats.cancelled_with_stock++;
                    else stats.cancelled_without_stock++;
                }
            }
        }

        if (orders.length < pageSize) hasMore = false;
        else offset += pageSize;
    }

    console.log('Estatísticas de Estoque (Bling):', stats);
}

checkStockProcessed().catch(console.error);
