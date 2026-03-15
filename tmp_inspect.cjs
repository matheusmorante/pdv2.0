const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    console.log("--- Checking Supplier ---");
    const { data: sups, error: errSup } = await supabase.from('suppliers').select('*').ilike('name', '%MOVELIP%');
    console.log("Suppliers found:", sups);

    console.log("\n--- Checking Product Columns ---");
    const { data: prods, error: errProd } = await supabase.from('products').select('*').limit(1);
    if (prods && prods.length > 0) {
        console.log("Columns:", Object.keys(prods[0]));
    } else {
        console.log("No products found to inspect columns.");
    }
}

inspect();
