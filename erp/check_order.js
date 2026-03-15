
const { createClient } = require('@supabase/supabase-client');
require('dotenv').config({ path: './.env' });

// In Vite projects, env vars are often prefixed with VITE_
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    console.log("Found env keys:", Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrder() {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('id', { ascending: false })
        .limit(3);

    if (error) {
        console.error(error);
    } else {
        console.log("Found orders:", data.length);
        data.forEach(order => {
            console.log("ID:", order.id);
            console.log("Order Data Items:", JSON.stringify(order.order_data?.items, null, 2));
        });
    }
}

checkOrder();
