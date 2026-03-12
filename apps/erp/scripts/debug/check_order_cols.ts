import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkColumns() {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error fetching order:', error);
    } else if (data && data[0]) {
        console.log('Colunas encontradas na tabela orders:');
        console.log(Object.keys(data[0]).join(', '));
    } else {
        console.log('Nenhum pedido encontrado na tabela orders.');
    }
    process.exit(0);
}

checkColumns();
