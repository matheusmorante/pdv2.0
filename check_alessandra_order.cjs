const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

if (!supabaseKey) {
    console.error("VITE_SUPABASE_ANON_KEY is missing");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrder() {
    console.log("Searching for order of 'Alessandra Ferreira'...");
    
    // Search in people table first to get customer id
    const { data: people, error: pError } = await supabase
        .from('people')
        .select('id, full_name')
        .ilike('full_name', '%Alessandra Ferreira%');
        
    if (pError) {
        console.error("Error searching people:", pError);
        return;
    }
    
    if (!people || people.length === 0) {
        console.log("No customer found with name 'Alessandra Ferreira'");
        return;
    }
    
    const personIds = people.map(p => p.id);
    console.log(`Found ${people.length} people:`, people);
    
    // Search in sales_orders
    const { data: orders, error: oError } = await supabase
        .from('sales_orders')
        .select('*')
        .in('customer_id', personIds)
        .order('created_at', { ascending: false });
        
    if (oError) {
        console.error("Error searching orders:", oError);
        return;
    }
    
    console.log(`Found ${orders?.length || 0} orders:`);
    orders?.forEach(o => {
        console.log(`- Order ID: ${o.id}, Status: ${o.status}, Total: ${o.total_value}, Type: ${o.order_type}`);
    });
}

checkOrder();
