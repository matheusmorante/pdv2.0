const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixCustomerFinal() {
    const id = 981; // ID found earlier
    console.log(`Fixing customer ${id}...`);

    const updates = {
        is_draft: false,
        person_type: 'PF',
        cpf_cnpj: '000.000.000-00', // Placeholder
        email: 'contato@exemplo.com', // Placeholder
        nickname: 'Kaline',
        rg_ie: '0000', // Placeholder
        active: true,
        address: {
            cep: "83650-000",
            city: "Balsa Nova",
            state: "PR",
            number: "165",
            street: "Rua Ricardo Jacomasso",
            complement: "Casa",
            neighborhood: "Conj. Hab. Moradias Iguaçu"
        }
    };

    const { data, error } = await supabase
        .from('people')
        .update(updates)
        .eq('id', id);

    if (error) console.error("Error updating:", error);
    else console.log("Customer updated successfully!");
}

fixCustomerFinal();
