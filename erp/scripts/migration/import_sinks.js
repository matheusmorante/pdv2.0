import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    try {
        const productIdsToDelete = [385, 386];
        console.log("Cleaning up previous entries...");
        await supabase.from('products').delete().in('id', productIdsToDelete);

        console.log("Checking supplier...");
        let { data: suppliers } = await supabase
            .from('people')
            .select('id, full_name')
            .ilike('full_name', '%Inox Sul%');
        
        let supplierId = suppliers?.[0]?.id;

        console.log(`Using supplier ID: ${supplierId}`);

        const description = "PIA INOX 1,20X53 INFINITY";
        console.log(`Creating merged product: ${description}`);
            
        const variations = [
            {
                id: crypto.randomUUID(),
                name: "COM FURO - Sem Válvula",
                unitPrice: 349,
                costPrice: 189,
                active: true,
                stock: 0
            },
            {
                id: crypto.randomUUID(),
                name: "COM FURO - Com Válvula",
                unitPrice: 379, // +30
                costPrice: 204, // +15
                active: true,
                stock: 0
            },
            {
                id: crypto.randomUUID(),
                name: "SEM FURO - Sem Válvula",
                unitPrice: 299,
                costPrice: 162,
                active: true,
                stock: 0
            },
            {
                id: crypto.randomUUID(),
                name: "SEM FURO - Com Válvula",
                unitPrice: 329, // +30
                costPrice: 177, // +15
                active: true,
                stock: 0
            }
        ];

        const { data: newProd, error: prodErr } = await supabase
            .from('products')
            .insert([{
                description: description,
                brand: 'Inox Sul',
                unit_price: 299, // Base price (Sem Furo)
                cost_price: 162,
                unit: 'UN',
                active: true,
                deleted: false,
                supplier_id: supplierId,
                has_variations: true,
                variations: variations,
                category: 'COZINHA >> PIAS',
                item_type: 'product',
                condition: 'novo'
            }])
            .select();

        if (prodErr) {
            console.error("Error creating product:", prodErr);
        } else {
            console.log("Successfully created merged product:", newProd[0].id);
        }

    } catch (e) {
        console.error(e);
    }
}

run();
