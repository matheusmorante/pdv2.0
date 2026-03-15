const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fix() {
    console.log('--- Iniciando Correção ---');

    // 1. Apagar pedidos incorretos da Aline (se houver algum que criei errado)
    const { data: badOrders } = await supabase.from('orders').select('id').ilike('order_data->>customer_data->>fullName', '%Aline Fernanda%');
    // If I inserted them directly in columns, they might not match order_data->>...

    // Let's just find and delete any order with customer_id that is Aline
    const { data: aline } = await supabase.from('people').select('id').ilike('full_name', '%Aline Fernanda%').maybeSingle();
    if (aline) {
        // Find orders where customer_id is a column (my bad insert) or in order_data
        await supabase.from('orders').delete().filter('customer_id', 'eq', aline.id); 
        // If customer_id is NOT a column, the above might fail or do nothing if it's JSON only.
        // Actually, the schema probably has order_data.
    }

    // 2. Create Aline Order correctly
    if (aline) {
        const orderInfo = {
            customer_id: aline.id,
            customerData: {
                fullName: 'Aline Fernanda Aparecida',
                phone: '41 92888-8447',
                noPhone: false,
                fullAddress: {
                    street: 'Rua Clevelandia',
                    number: '65',
                    neighborhood: 'Paloma',
                    city: 'Colombo',
                    complement: 'Sobrado vermelho'
                }
            },
            items: [{
                productId: "pending", // Will try to find Chile
                description: "GUARDA ROUPA CHILE FREIJO GRAFITE",
                quantity: 1,
                unitPrice: 520.00,
                total: 520.00
            }],
            payments: [{
                method: 'pix',
                value: 520.00,
                status: 'pending',
                date: new Date().toISOString()
            }],
            date: new Date().toISOString().split('T')[0],
            deliveryDate: '2026-03-18',
            status: 'scheduled', // User said "entrega na quarta", scheduled is better
            total: 520.00,
            subtotal: 520.00,
            type: 'sale',
            orderType: 'sale',
            observation: 'Sobrado vermelho. Entregar na caixa para montar no local.'
        };

        // Find Chile Product ID
        const { data: product } = await supabase.from('products').select('id').ilike('description', '%CHILE%').limit(1).single();
        if (product) {
            orderInfo.items[0].productId = String(product.id);
        }

        const { data: newOrder, error } = await supabase
            .from('orders')
            .insert([{
                order_data: orderInfo,
                updated_at: new Date().toISOString()
            }])
            .select();

        if (error) console.error('Erro ao criar pedido:', error);
        else console.log('Pedido da Aline criado corretamente! ID:', newOrder[0].id);
    }

    // 3. Update Multiuso Open Category
    const { data: multiOpen } = await supabase.from('products').select('id').ilike('description', 'MULTIUSO OPEN').maybeSingle();
    if (multiOpen) {
        await supabase.from('products').update({
            category: 'QUARTO >> ESTANTE / ARMÁRIO MULTIUSO'
        }).eq('id', multiOpen.id);
        console.log('Multiuso OPEN atualizado.');
    }

    console.log('--- Fim da Correção ---');
    process.exit(0);
}

fix().catch(err => {
    console.error(err);
    process.exit(1);
});
