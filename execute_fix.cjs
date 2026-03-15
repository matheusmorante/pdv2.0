const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fix() {
    console.log("--- Starting Global Fix ---");

    // 1. PIA DE INOX 1,20 (Fixing variations)
    // First, let's look for any variations that are "with valve" or "without valve"
    const { data: badVars } = await supabase.from('products').select('*').or('name.ilike.%vlvula%');
    console.log("Found bad valve-based variations:", badVars?.length);
    
    if (badVars && badVars.length > 0) {
        // We'll update them to "furo" based names or just delete and recreate.
        // User says only "com furo" and "sem furo" exist.
        for (const v of badVars) {
            let newName = v.description.replace(/v[áa]lvula/gi, 'furo');
            await supabase.from('products').update({ description: newName }).eq('id', v.id);
        }
    }

    // 2. Multiuso Bris 2315A 2PTS - Ensure it exists and is active
    const { data: bris } = await supabase.from('products').select('*').ilike('description', '%BRIS%');
    console.log("Bris Products found:", bris?.length);
    
    // If not found, we create it
    if (!bris || bris.length === 0) {
        const brisParent = {
            code: 'BRIS-2315A',
            description: 'MULTIUSO BRIS 2315A 2PTS',
            brand: 'MOVELIPE',
            unit_price: 249,
            active: true,
            has_variations: true,
            item_type: 'product',
            variations: [
                { sku: 'BRIS-2315A-NAT', name: 'MULTIUSO BRIS 2315A - NATURE', unitPrice: 249, active: true },
                { sku: 'BRIS-2315A-BRA', name: 'MULTIUSO BRIS 2315A - BRANCO', unitPrice: 249, active: true }
            ]
        };
        await supabase.from('products').insert([brisParent]);
        console.log("Created Multiuso Bris with variations (Nature/Branco).");
    }

    // 3. Ensuring "com furo" and "sem furo" for Pia Inox 1,20
    const { data: piaParent } = await supabase.from('products').select('*').ilike('description', '%PIA%INOX%1,20%');
    if (piaParent && piaParent.length > 0) {
        console.log("Found Pia Inox parent, updating variations.");
        const p = piaParent[0];
        const variations = [
            { sku: 'PIA-INOX-120-FURO', name: 'PIA INOX 1,20X53 - COM FURO', unitPrice: 349, active: true },
            { sku: 'PIA-INOX-120-SFURO', name: 'PIA INOX 1,20X53 - SEM FURO', unitPrice: 299, active: true }
        ];
        await supabase.from('products').update({ 
            has_variations: true, 
            variations: variations,
            active: true 
        }).eq('id', p.id);
    } else {
         // Create parent if missing
         const newPia = {
            code: 'PIA-INOX-120',
            description: 'PIA INOX 1,20X53 INFINITY',
            brand: 'MOVELIPE',
            unit_price: 299,
            active: true,
            has_variations: true,
            item_type: 'product',
            variations: [
                { sku: 'PIA-INOX-120-FURO', name: 'PIA INOX 1,20X53 - COM FURO', unitPrice: 349, active: true },
                { sku: 'PIA-INOX-120-SFURO', name: 'PIA INOX 1,20X53 - SEM FURO', unitPrice: 299, active: true }
            ]
        };
        await supabase.from('products').insert([newPia]);
        console.log("Created Pia Inox 1,20 parent with variations.");
    }

    console.log("--- Fix Concluded ---");
}

fix().catch(err => console.error("Fatal:", err));
