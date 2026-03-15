const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function addProduct() {
    console.log("Verificando se MULTIUSO OPEN já existe...");

    const { data: existing, error: checkErr } = await supabase
        .from('products')
        .select('id')
        .ilike('description', 'MULTIUSO OPEN')
        .eq('deleted', false)
        .limit(1);

    if (checkErr) {
        console.error("Erro ao verificar produto:", checkErr);
        return;
    }

    if (existing && existing.length > 0) {
        console.log("O produto MULTIUSO OPEN já existe (ID: " + existing[0].id + ").");
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

    console.log("Inserindo novo produto...");
    const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select('id')
        .single();

    if (error) {
        console.error("Erro ao inserir produto:", error);
        return;
    }

    const productId = data.id;
    console.log(`Produto inserido com sucesso! ID: ${productId}`);

    // Link category "ESTANTE"
    const { data: catData } = await supabase.from('categories').select('id').ilike('name', 'ESTANTE').single();
    if (catData) {
        console.log(`Vinculando à categoria ESTANTE (ID: ${catData.id})...`);
        await supabase.from('product_categories').insert({ product_id: productId, category_id: catData.id });
    } else {
        console.log("Categoria ESTANTE não encontrada. Criando...");
        const { data: newCat, error: catErr } = await supabase.from('categories').insert({ name: "ESTANTE", active: true }).select('id').single();
        if (newCat) {
            await supabase.from('product_categories').insert({ product_id: productId, category_id: newCat.id });
        }
    }

    console.log("Processo concluído!");
}

addProduct().catch(console.error);
