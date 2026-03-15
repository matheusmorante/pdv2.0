const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectOrders() {
    console.log("Inspecting 5 most recent orders...");
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('id', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching orders:", error.message);
    } else {
        orders.forEach(o => {
            console.log(`\n--- Order ID: ${o.id} ---`);
            console.log("Order Data keys:", Object.keys(o.order_data || {}));
            if (o.order_data?.customer) {
                console.log("Customer field:", JSON.stringify(o.order_data.customer, null, 2));
            } else if (o.order_data?.customerName) {
                console.log("CustomerName field:", o.order_data.customerName);
            } else {
                console.log("Full Order Data:", JSON.stringify(o.order_data, null, 2));
            }
        });
    }
}

inspectOrders();
