const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data: products, error } = await supabase
        .from('products')
        .select('id, description, code, is_variation, parent_id')
        .or('description.ilike.%AROMA%,description.ilike.%PIA%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(JSON.stringify(products, null, 2));
}

run();
