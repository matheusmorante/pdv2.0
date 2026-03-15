import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrder() {
    console.log("Searching for order of 'Alessandra Ferreira'...");
    
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
    
    console.log("Found people:", people);
    const personIds = people.map(p => p.id);
    
    const { data: orders, error: oError } = await supabase
        .from('orders')
        .select('*')
        .order('updated_at', { ascending: false });
        
    if (oError) {
        console.error("Error searching orders:", oError);
        return;
    }
    
    const relevantOrders = orders.filter(o => 
        people.some(p => o.order_data?.customerData?.fullName?.includes(p.full_name) || o.order_data?.customerData?.fullName === p.full_name)
    );

    console.log(`Found ${relevantOrders.length} relevant orders:`);
    relevantOrders.forEach(o => {
        console.log(`- ID: ${o.id}, Status: ${o.order_data?.status}, Type: ${o.order_data?.orderType}, Updated: ${o.updated_at}`);
        console.log(`  Items: ${o.order_data?.items?.length || 0}`);
    });
}

checkOrder();
