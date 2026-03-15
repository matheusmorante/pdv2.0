const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log("--- INICIANDO FIX FINAL ---");

    // 1. Limpeza de tentativas anteriores
    console.log("Limpando produtos Chile antigos...");
    await supabase.from('products').delete().ilike('description', '%CHILE%');

    // 2. Importação Mopar
    console.log("Lendo mopar.csv...");
    const csvData = fs.readFileSync('../../mopar.csv', 'utf8');
    const lines = csvData.split('\n');
    let lastProduct = null;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(';').map(p => p.replace(/^"|"$/g, '').trim());
        if (parts.length < 3) continue;

        const description = parts[2];
        const costPrice = parseFloat(parts[11]?.replace(',', '.') || '0');
        const unitPrice = parseFloat(parts[6]?.replace(',', '.') || '0');
        const code = parts[1] || "";
        const categoryStr = parts[57] || "";

        if (description.startsWith("COR:")) {
            if (lastProduct) {
                console.log(`Adicionando variação ${description} para ${lastProduct.description}`);
                const variation = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: description.replace("COR:", ""),
                    sku: code || Math.random().toString(36).substr(2, 6).toUpperCase(),
                    stock: 0,
                    unitPrice: unitPrice,
                    costPrice: costPrice
                };
                lastProduct.variations = lastProduct.variations || [];
                lastProduct.variations.push(variation);
            }
        } else {
            if (lastProduct) {
                // Salvar o anterior antes de começar um novo
                await saveProduct(lastProduct);
            }
            console.log(`Novo produto: ${description}`);
            lastProduct = {
                description: description,
                code: code,
                unitPrice: unitPrice,
                costPrice: costPrice,
                category: categoryStr,
                active: true,
                deleted: false,
                itemType: 'product',
                brand: 'MOPAR',
                condition: 'novo',
                hasVariations: true,
                variations: []
            };
        }
    }
    if (lastProduct) await saveProduct(lastProduct);

    // 3. Corrigir CATEGORIA MULTIUSO OPEN
    console.log("Corrigindo Multiuso OPEN...");
    await supabase.from('products').update({ category: 'QUARTO >> ESTANTE / ARMÁRIO MULTIUSO' }).ilike('description', '%MULTIUSO OPEN%');

    // 4. Corrigir Pedido ALINE
    console.log("Corrigindo Pedido Aline...");
    // Buscar produto Chile para o pedido
    const { data: chileProds } = await supabase.from('products').select('*').ilike('description', '%CHILE%').limit(1);
    if (chileProds && chileProds.length > 0) {
        const product = chileProds[0];
        const variation = product.variations?.find(v => v.name.includes('GRAFITE')) || product.variations?.[0];

        // Remover pedidos antigos da Aline para evitar duplicidade
        await supabase.from('sales_orders').delete().ilike('customer_name', '%Aline Fernanda%');

        const orderData = {
            customer_name: "ALINE FERNANDA APARECIDA",
            customer_phone: "41992244631",
            total_amount: 549,
            status: 'pending',
            payment_status: 'pending',
            seller_name: "LOJA",
            items: [{
                productId: product.id,
                variationId: variation?.id,
                description: `${product.description} - ${variation?.name || ''}`,
                quantity: 1,
                unitPrice: 549,
                totalPrice: 549
            }],
            payments: [{
                method: 'pix',
                amount: 549,
                status: 'pending'
            }],
            shipping_address: "Rua cascavel 306, Colombo (Sobrado vermelho)",
            delivery_date: "2026-03-15",
            created_at: new Date().toISOString()
        };

        const { error: orderError } = await supabase.from('sales_orders').insert([orderData]);
        if (orderError) console.error("Erro ao criar pedido Aline:", orderError);
        else console.log("Pedido Aline criado com sucesso!");
    }

    console.log("--- FINALIZADO ---");
    process.exit(0);
}

async function saveProduct(p) {
    p.hasVariations = p.variations.length > 0;
    const { data, error } = await supabase.from('products').insert([p]).select();
    if (error) console.error(`Erro ao salvar ${p.description}:`, error);
    return data?.[0];
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
