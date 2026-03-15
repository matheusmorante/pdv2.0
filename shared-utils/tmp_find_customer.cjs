const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findCustomer() {
    // Try customers table
    console.log("Searching in 'people' table...");
    const { data: people, error: pError } = await supabase
        .from('people')
        .select('*')
        .ilike('name', '%Kaline Estevam%');
    
    if (pError) console.error("People error:", pError);
    else console.log("People found:", JSON.stringify(people, null, 2));

    // Also check for orders (pedidos) as the user mentioned "pedido"
    console.log("Searching in 'sales_orders' table...");
    const { data: orders, error: oError } = await supabase
        .from('sales_orders')
        .select('*, people(*)')
        .ilike('people.name', '%Kaline Estevam%');
    
    if (oError) {
        // If join fails, maybe simple select
        const { data: orders2 } = await supabase.from('sales_orders').select('*').limit(5);
        console.log("Sales orders samples:", JSON.stringify(orders2, null, 2));
    } else {
        const filteredOrders = orders.filter(o => o.people);
        console.log("Orders for Kaline:", JSON.stringify(filteredOrders, null, 2));
    }
}

findCustomer();
