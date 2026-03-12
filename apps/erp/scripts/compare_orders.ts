import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function compare() {
    const { data: blingOrders } = await supabase.from('orders').select('*').filter('order_data->>marketingOrigin', 'eq', 'Bling').limit(1);
    const { data: localOrders } = await supabase.from('orders').select('*').filter('order_data->>marketingOrigin', 'eq', 'Direto na Loja').limit(1);

    console.log('--- BLING ORDER ---');
    console.log(JSON.stringify(blingOrders?.[0]?.order_data, null, 2));
    
    console.log('\n--- LOCAL ORDER ---');
    console.log(JSON.stringify(localOrders?.[0]?.order_data, null, 2));
}

compare().catch(console.error);
