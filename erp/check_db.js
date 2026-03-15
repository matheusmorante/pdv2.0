const { createClient } = require('@supabase/supabase-client');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.from('inventory_moves').select('*').limit(1);
    if (error) {
        console.error('Error:', JSON.stringify(error));
    } else if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]).join(', '));
    } else {
        console.log('No data in inventory_moves');
        // Try to get one from products to see if we can at least connect
        const { data: pData } = await supabase.from('products').select('*').limit(1);
        if (pData) console.log('Products columns:', Object.keys(pData[0]).join(', '));
    }
}

check();
