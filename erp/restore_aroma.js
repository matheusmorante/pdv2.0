import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('--- Buscando Criado Mudo Aroma ---');
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('description', '%Criado Mudo Aroma%');

    if (error) {
        console.error('Erro:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('Produto não encontrado.');
        return;
    }

    const p = data[0];
    console.log(`Restaurando: ${p.description} (ID: ${p.id})`);

    const { error: updateError } = await supabase
        .from('products')
        .update({
            is_draft: false,
            deleted: false,
            updated_at: new Date().toISOString()
        })
        .eq('id', p.id);

    if (updateError) {
        console.error('Erro no update:', updateError);
    } else {
        console.log('SUCESSO: Produto restaurado!');
    }
}

run();
