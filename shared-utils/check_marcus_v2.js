
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: rawOrders, error } = await supabase.from('orders').select('*');
    if (error) {
        console.error('Error:', error);
        return;
    }
    const marcusOrders = rawOrders.filter(row => row.order_data?.customerData?.fullName?.toLowerCase().includes('marcus'));
    
    if (marcusOrders.length === 0) {
        console.log('No orders found for Marcus');
        return;
    }

    marcusOrders.forEach(row => {
        const o = row.order_data;
        console.log(`--- Order #${row.id} ---`);
        console.log(`Customer: ${o.customerData?.fullName}`);
        console.log(`Type: ${o.orderType}`);
        console.log(`Status: ${o.status}`);
        console.log('Items:');
        (o.items || []).forEach(i => console.log(` - ${i.description} (ID: ${i.productId || 'MISSING'})`));
        console.log('Assistance Items:');
        (o.assistanceItems || []).forEach(i => console.log(` - ${i.description} (Original: ${i.originalOrderId})`));
    });
}
run();
