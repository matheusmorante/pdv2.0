import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAlessandra() {
    console.log("Searching for 'Alessandra Ferreira' with JSONB filters...");
    
    // Try contains filter
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .contains('order_data', { customerData: { fullName: 'Alessandra Ferreira' } });

    if (error) {
        console.error("Error fetching orders:", error);
    } else if (orders.length > 0) {
        console.log(`Found ${orders.length} orders by exact name.`);
        orders.forEach(o => console.log(`ID: ${o.id}, Data: ${JSON.stringify(o.order_data, null, 2)}`));
    } else {
        console.log("No exact match. Trying text search...");
        const { data: allOrders, error: allErr } = await supabase
            .from('orders')
            .select('*')
            .order('id', { ascending: false })
            .limit(50);
            
        if (allErr) {
            console.error("Error:", allErr);
            return;
        }
        
        const partial = allOrders.filter(o => 
            o.order_data?.customerData?.fullName?.toLowerCase().includes("alessandra")
        );
        
        console.log(`Found ${partial.length} partial matches in last 50 orders.`);
        partial.forEach(o => console.log(`ID: ${o.id}, Customer: ${o.order_data?.customerData?.fullName}, Status: ${o.order_data?.status}`));
    }
}

findAlessandra();
