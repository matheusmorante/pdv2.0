const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log('--- Iniciando Cadastro da Aline ---');

    // 1. Check/Create Person
    let personId;
    const { data: existingPerson } = await supabase
        .from('people')
        .select('id')
        .ilike('full_name', 'Aline Fernanda Aparecida')
        .eq('deleted', false)
        .maybeSingle();

    if (existingPerson) {
        personId = existingPerson.id;
        console.log('Cliente já cadastrada:', personId);
    } else {
        const { data: newPerson, error: pErr } = await supabase
            .from('people')
            .insert([{
                full_name: 'Aline Fernanda Aparecida',
                phone: '41 92888-8447',
                type: 'customers',
                active: true,
                deleted: false,
                full_address: {
                    street: 'Rua Clevelandia',
                    number: '65',
                    neighborhood: 'Paloma',
                    city: 'Colombo',
                    complement: 'Sobrado vermelho'
                }
            }])
            .select('id')
            .single();
        
        if (pErr) throw pErr;
        personId = newPerson.id;
        console.log('Nova cliente cadastrada:', personId);
    }

    // 2. Find Product Chile Freijo/Grafite
    // It should have been imported by import_mopar_full.cjs
    const { data: product } = await supabase
        .from('products')
        .select('*')
        .ilike('description', '%CHILE%')
        .eq('deleted', false)
        .maybeSingle();

    if (!product) {
        throw new Error('Produto CHILE não encontrado no banco.');
    }

    const variation = product.variations?.find(v => v.name.includes('GRAFITE'));
    if (!variation) {
        console.warn('Variação GRAFITE não encontrada, usando produto base.');
    }

    // 3. Create Order
    const orderData = {
        customer_id: personId,
        customer_data: {
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
            productId: String(product.id),
            variationId: variation ? String(variation.id) : null,
            description: variation ? `GUARDA ROUPA CHILE - ${variation.name}` : `GUARDA ROUPA CHILE`,
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
        delivery_date: '2026-03-18',
        status: 'pending',
        total: 520.00,
        subtotal: 520.00,
        type: 'sale',
        observation: 'Sobrado vermelho'
    };

    const { data: newOrder, error: oErr } = await supabase
        .from('orders')
        .insert([orderData])
        .select('id')
        .single();

    if (oErr) throw oErr;
    console.log('Pedido criado com sucesso! ID:', newOrder.id);
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
