const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log("--- INSPECTING PRODUCTS ---");

    // 1. Check Criado Mudo Aroma
    const { data: aroma } = await supabase.from('products').select('*').ilike('description', '%Aroma%');
    console.log("Aroma Products:", JSON.stringify(aroma?.map(p => ({ id: p.id, desc: p.description, has_vars: p.has_variations, vars_count: p.variations?.length })), null, 2));

    // 2. Check Pia de Inox
    const { data: pia } = await supabase.from('products').select('*').ilike('description', '%Pia%Inox%');
    console.log("Pia Products:", JSON.stringify(pia?.map(p => ({ id: p.id, desc: p.description, has_vars: p.has_variations, vars_count: p.variations?.length })), null, 2));

    // 3. Check for loose variations by searching for common variation terms in description
    const { data: vars } = await supabase.from('products').select('*').or('description.ilike.%furo%,description.ilike.%valvula%');
    console.log("Variations Search:", JSON.stringify(vars?.map(p => ({ id: p.id, desc: p.description })), null, 2));
}

run();
