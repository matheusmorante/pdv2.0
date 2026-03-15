import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkModalidade() {
    const { data: orders } = await supabase
        .from('orders')
        .select('order_data')
        .limit(10);

    for (const order of orders || []) {
        const od = order.order_data;
        if (od?.marketingOrigin === 'Bling') {
            console.log(`Pedido #${od.orderIndex}:`);
            console.log(` - deliveryMethod: ${od.shipping?.deliveryMethod}`);
            console.log(` - orderType: ${od.shipping?.orderType}`);
        }
    }
}

checkModalidade().catch(console.error);
