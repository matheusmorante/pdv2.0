const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixCustomer() {
    console.log("Searching for Kaline Estevam...");
    const { data: people, error } = await supabase
        .from('people')
        .select('*')
        .ilike('full_name', '%Kaline Estevam%');
    
    if (error) {
        console.error("Error:", error);
        return;
    }

    if (!people || people.length === 0) {
        console.log("Customer not found.");
        return;
    }

    const kaline = people[0];
    console.log("Current data:", JSON.stringify(kaline, null, 2));

    // Fill missing mandatory fields
    const updates = {
        is_draft: false,
        person_type: kaline.person_type || 'PF',
        cpf_cnpj: kaline.cpf_cnpj || '000.000.000-00',
        phone: kaline.phone || '(00) 00000-0000',
        email: kaline.email || 'contato@exemplo.com',
        address: kaline.address || 'Nao informado'
    };

    console.log("Updating with:", updates);
    const { data, error: uError } = await supabase
        .from('people')
        .update(updates)
        .eq('id', kaline.id);

    if (uError) console.error("Update error:", uError);
    else console.log("Update successful!");
}

fixCustomer();
