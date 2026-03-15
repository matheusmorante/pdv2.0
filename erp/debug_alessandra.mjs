import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAlessandraOrder() {
    console.log("Listing last orders to find Alessandra...");
    const { data: orders, error } = await supabase.from('orders').select('*').order('id', { ascending: false }).limit(20);
    
    if (error) {
        console.error(error);
        return;
    }

    const alessandraOrder = orders.find(o => JSON.stringify(o.order_data).includes('Alessandra'));
    if (!alessandraOrder) {
        console.log("Alessandra not found in last 20 orders.");
        return;
    }

    console.log("Found order:", alessandraOrder.id);
    const orderData = alessandraOrder.order_data;
    console.log("Status:", orderData.status);
    console.log("Customer:", orderData.customerData?.fullName);
    
    const items = orderData.items || [];
    console.log("Items Count:", items.length);

    for (const item of items) {
        console.log(`- Item: ${item.description}, ID: ${item.productId}, VariationID: ${item.variationId}, Qty: ${item.quantity}`);
        if (item.productId) {
            const { data: product } = await supabase.from('products').select('stock, description').eq('id', item.productId).single();
            console.log(`  Current Stock: ${product?.stock}`);
        } else {
            console.log(`  UNLINKED (No Product ID)`);
        }
    }
}

checkAlessandraOrder();
