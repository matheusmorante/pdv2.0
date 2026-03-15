const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function diagnose() {
    console.log("--- Diagnosing Products ---");
    
    // 1. Multiuso Bris
    const { data: bris, error: errBris } = await supabase
        .from('products')
        .select('*')
        .ilike('name', '%BRIS%');
    console.log("\nMultiuso Bris search results:", bris?.map(p => ({ id: p.id, name: p.name, sku: p.sku, parent_id: p.parent_id })));

    // 2. Pia de Inox
    const { data: pia, error: errPia } = await supabase
        .from('products')
        .select('*')
        .ilike('name', '%PIA%INOX%');
    console.log("\nPia de Inox search results:", pia?.map(p => ({ id: p.id, name: p.name, sku: p.sku, parent_id: p.parent_id })));

    // 3. Loose variations (parent_id is set but parent doesnt exist or something else)
    // Actually, let's look for variations with suspicious names or IDs
    const { data: vars, error: errVars } = await supabase
        .from('products')
        .select('*')
        .or('name.ilike.%furo%,name.ilike.%vlvula%');
    console.log("\n suspicious variations:", vars?.map(p => ({ id: p.id, name: p.name, sku: p.sku, parent_id: p.parent_id })));
}

diagnose();
