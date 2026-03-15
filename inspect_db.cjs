const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log('--- PRODUCTS COLUMNS ---');
    const { data: colsP, error: errP } = await supabase.rpc('get_table_columns', { table_name: 'products' });
    // If RPC doesn't exist, we can try a direct query to information_schema if permitted
    if (errP) {
        const { data: cols, error: err } = await supabase
            .from('products')
            .select('*')
            .limit(1);
        if (cols && cols.length > 0) {
            console.log(Object.keys(cols[0]).join(', '));
        } else {
            console.log('Error fetching columns:', errP || err);
        }
    } else {
        console.log(colsP);
    }

    console.log('\n--- ORDERS COLUMNS ---');
    const { data: colsO, error: errO } = await supabase
        .from('orders')
        .select('*')
        .limit(1);
    if (colsO && colsO.length > 0) {
        console.log(Object.keys(colsO[0]).join(', '));
        console.log('\nSample order_data keys:', Object.keys(colsO[0].order_data || {}).join(', '));
        if (colsO[0].order_data?.items && colsO[0].order_data.items.length > 0) {
            console.log('\nSample item keys:', Object.keys(colsO[0].order_data.items[0]).join(', '));
        }
    } else {
        console.log('No orders found or error:', errO);
    }
}

run();
