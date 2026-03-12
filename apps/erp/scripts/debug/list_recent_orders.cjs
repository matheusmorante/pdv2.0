const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listRecentOrders() {
    console.log("Fetching orders from the last 24 hours...");
    
    // Get current date minus 24 hours
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    
    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, updated_at, order_data')
        .gte('updated_at', yesterday.toISOString())
        .order('updated_at', { ascending: false });

    if (error) {
        console.error("Error fetching recent orders:", error.message);
    } else {
        console.log(`Found ${orders.length} recent orders:`);
        orders.forEach(o => {
            const customer = o.order_data?.customer?.full_name || o.order_data?.customerName || 'N/A';
            console.log(`ID: ${o.id} | Updated: ${o.updated_at} | Customer: ${customer}`);
        });
    }
}

listRecentOrders();
