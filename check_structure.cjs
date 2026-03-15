const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log('Fetching products with missing codes...');
    const { data: pMissing, error: errP } = await supabase
        .from('products')
        .select('id, description, code, is_variation, parent_id')
        .is('code', null);
    
    if (errP) console.log('Error p:', errP);
    else console.log('Products without code:', pMissing?.length || 0);

    console.log('\nFetching one order to check item structure...');
    const { data: orders, error: errO } = await supabase
        .from('orders')
        .select('id, order_data')
        .limit(1);
    
    if (errO) console.log('Error o:', errO);
    else if (orders && orders.length > 0) {
        const order = orders[0];
        console.log('Order ID:', order.id);
        const item = order.order_data?.items?.[0];
        if (item) {
            console.log('Sample item structure:', JSON.stringify(item, null, 2));
        } else {
            console.log('Order has no items.');
        }
    } else {
        console.log('No orders found.');
    }
}

run();
