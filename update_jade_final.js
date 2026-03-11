
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const prodId = 122;
    const catId = 'f8e2c3c1-3280-40f3-b398-f04ee7666aad'; // ARMÁRIO MULTIUSO

    console.log(`Updating product ID ${prodId} (Jade) to category ARMÁRIO MULTIUSO and condition novo...`);
    await supabase.from('products').update({ 
        category: 'ARMÁRIO MULTIUSO',
        condition: 'novo'
    }).eq('id', prodId);

    await supabase.from('product_categories').delete().eq('product_id', prodId);
    await supabase.from('product_categories').insert([{
        product_id: prodId,
        category_id: catId
    }]);

    console.log('Update complete.');
}

run();
