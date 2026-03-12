const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDrafts() {
    console.log("Checking all drafts in the DB...");
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*');

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    const drafts = orders.filter(o => {
        return o.order_data?.status === 'draft' && !o.order_data?.deleted;
    });

    console.log(`Found ${drafts.length} non-deleted drafts.`);
    drafts.forEach(o => {
        console.log(`\nID: ${o.id}`);
        console.log(`Date: ${o.order_data?.date}`);
        console.log(`Customer: ${o.order_data?.customerData?.fullName || o.order_data?.customer?.fullName || 'N/A'}`);
        console.log(`Total Value: ${o.order_data?.paymentsSummary?.totalOrderValue || 0}`);
    });
}

checkDrafts();
