const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log("--- STARTING PRODUCT CORRECTION ---");

    // 1. Search for Multiuso Bris
    const { data: brisProducts } = await supabase.from('products').select('*').ilike('name', '%BRIS%');
    console.log("Bris Products:", JSON.stringify(brisProducts, null, 2));

    // 2. Search for Pia Inox and related variations
    const { data: piaProducts } = await supabase.from('products').select('*').ilike('name', '%PIA%INOX%');
    console.log("Pia Inox Products:", JSON.stringify(piaProducts, null, 2));

    const { data: variations } = await supabase.from('products').select('*').or('name.ilike.%furo%,name.ilike.%vlvula%');
    console.log("Potential Variations:", JSON.stringify(variations, null, 2));

    console.log("--- DATA COLLECTED ---");
}

run();
