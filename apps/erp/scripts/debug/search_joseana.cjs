const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function searchJoseana() {
    console.log("Searching in 'people' table...");
    const { data: people, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .or('full_name.ilike.%joseana%,nickname.ilike.%joseana%');
    
    if (peopleError) console.error("Error searching people:", peopleError.message);
    else console.log("People found:", JSON.stringify(people, null, 2));

    console.log("\nSearching in 'orders' table (order_data)...");
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*');

    if (ordersError) {
        console.error("Error fetching orders:", ordersError.message);
    } else {
        const matchingOrders = orders.filter(o => {
            const str = JSON.stringify(o.order_data).toLowerCase();
            return str.includes('joseana');
        });
        console.log(`Found ${matchingOrders.length} orders matching 'joseana':`);
        console.log(JSON.stringify(matchingOrders, null, 2));
    }
}

searchJoseana();
