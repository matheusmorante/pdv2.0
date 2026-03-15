import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkStatuses() {
    console.log('--- ANALISANDO STATUS DOS PEDIDOS BLING ---');
    
    let hasMore = true;
    let offset = 0;
    const pageSize = 1000;
    const allStatuses = new Set();
    const statusCounts = new Map();

    while (hasMore) {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('order_data')
            .range(offset, offset + pageSize - 1);

        if (error || !orders || orders.length === 0) break;

        for (const order of orders) {
            const od = order.order_data;
            if (od?.marketingOrigin === 'Bling') {
                const s = String(od.status || 'sem_status');
                allStatuses.add(s);
                statusCounts.set(s, (statusCounts.get(s) || 0) + 1);
            }
        }

        if (orders.length < pageSize) hasMore = false;
        else offset += pageSize;
    }

    console.log('Status encontrados:', Array.from(allStatuses));
    console.log('Contagem:', Object.fromEntries(statusCounts));
}

checkStatuses().catch(console.error);
