const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function addProduct() {
    try {
        const { data: existing } = await supabase
            .from('products')
            .select('id')
            .ilike('description', 'MULTIUSO OPEN')
            .eq('deleted', false)
            .limit(1);

        if (existing && existing.length > 0) {
            fs.writeFileSync('result.txt', 'EXISTING: ' + existing[0].id);
            return;
        }

        const newProduct = {
            description: "MULTIUSO OPEN",
            brand: "MOVELIPE",
            category: "QUARTO >> ESTANTE",
            unit_price: 249.00,
            cost_price: 159.00,
            unit: "UN",
            active: true,
            deleted: false,
            condition: "NOVO",
            width: 56,
            height: 173,
            depth: 0,
            item_type: "product",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('products')
            .insert([newProduct])
            .select('id')
            .single();

        if (error) throw error;

        // Link category
        const { data: catData } = await supabase.from('categories').select('id').ilike('name', 'ESTANTE').single();
        if (catData) {
            await supabase.from('product_categories').insert({ product_id: data.id, category_id: catData.id });
        }

        fs.writeFileSync('result.txt', 'SUCCESS: ' + data.id);
    } catch (e) {
        fs.writeFileSync('result.txt', 'ERROR: ' + e.message);
    } finally {
         process.exit(0);
    }
}

addProduct();
setTimeout(() => process.exit(1), 15000);
