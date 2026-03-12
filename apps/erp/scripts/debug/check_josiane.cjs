const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:/Users/Rosilene/Desktop/pdv/apps/erp/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkJosianeOrders() {
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .or('order_data->customerData->>fullName.ilike.%Josi%,order_data->customer->>fullName.ilike.%Josi%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(JSON.stringify(orders, null, 2));
}

checkJosianeOrders();
