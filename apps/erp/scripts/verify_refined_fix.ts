import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyRefinedFix() {
    console.log('--- VERIFICANDO CORREÇÃO REFINADA ---');
    
    // Testar pedidos específicos citados anteriormente (1208 é um deles)
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .filter('order_data->>orderIndex', 'in', '("1208", "1310", "1319", "1451")')
        .order('id', { ascending: true });

    if (!orders || orders.length === 0) {
        console.log('Nenhum pedido encontrado para verificação.');
        return;
    }

    orders.forEach(order => {
        const od = order.order_data;
        console.log(`\nPedido #${od.orderIndex}:`);
        console.log(` - Status: ${od.status}`);
        console.log(` - Modalidade: ${od.shipping?.deliveryMethod}`);
        console.log(` - Tipo Pedido (Shipping): ${od.shipping?.orderType}`);
        console.log(` - Data Entrega: ${od.shipping?.scheduling?.date}`);
        console.log(` - Manuseio Item 1: ${od.items?.[0]?.handlingType}`);
        console.log(` - Total Pedido: ${od.paymentsSummary?.totalOrderValue}`);
        console.log(` - Pago: ${od.paymentsSummary?.totalAmountPaid}`);
    });
    
    // Verificar se ainda resta algum status com letra maiúscula no Bling
    const { data: allBling } = await supabase.from('orders').select('order_data');
    const statuses = new Set();
    allBling?.forEach(o => {
        if (o.order_data?.marketingOrigin === 'Bling') {
            statuses.add(o.order_data.status);
        }
    });
    console.log(`\nStatus únicos remanescentes no Bling:`, Array.from(statuses));
}

verifyRefinedFix().catch(console.error);
