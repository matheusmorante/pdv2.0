const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugOrders() {
    console.log("Searching for Josiane...");
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*');

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    const josianeOrders = orders.filter(o => {
        const str = JSON.stringify(o).toLowerCase();
        return str.includes('josiane');
    });

    console.log(`Found ${josianeOrders.length} orders mentioning Josiane.`);
    josianeOrders.forEach(o => {
        console.log(`\nID: ${o.id}`);
        console.log(`Deleted: ${o.order_data?.deleted}`);
        console.log(`Status: ${o.order_data?.status}`);
        console.log(`Customer Data Keys: ${Object.keys(o.order_data?.customerData || o.order_data?.customer || {})}`);
        console.log(`Full Name: ${o.order_data?.customerData?.fullName || o.order_data?.customer?.fullName || 'N/A'}`);
    });

    // Also check for very recent orders (last 24h) that might be missing
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentOrders = orders.filter(o => new Date(o.updated_at) > last24h);
    console.log(`\nFound ${recentOrders.length} orders updated in last 24h.`);
}

debugOrders();
