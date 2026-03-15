import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: orders } = await supabase.from('orders').select('*').order('id', { ascending: false }).limit(50);
    const order = orders?.find(o => JSON.stringify(o.order_data).includes('Alessandra'));
    if (!order) {
        console.log("Not found");
        return;
    }
    console.log("ID:", order.id);
    console.log("Status:", order.order_data.status);
    for (const item of order.order_data.items || []) {
        console.log(`- ${item.description} (ID: ${item.productId}) x${item.quantity}`);
        if (item.productId) {
            const { data: p } = await supabase.from('products').select('stock, description').eq('id', item.productId).single();
            console.log(`  Stock: ${p?.stock}`);
        }
    }
}
run();
