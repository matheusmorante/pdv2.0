import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function search() {
    console.log('--- BUSCANDO BALCÃO COPA (Ajustado) ---');
    
    // Busca por termo na descrição (coluna description)
    const { data: products, error: pError } = await supabase
        .from('products')
        .select('*')
        .ilike('description', '%Balcão%Copa%');
    
    if (pError) {
        console.error('Erro ao buscar produtos:', pError);
        return;
    }

    console.log(`Encontrados ${products?.length || 0} produtos pai:`);
    products?.forEach(p => {
        console.log(`- ID: ${p.id} | SKU: ${p.code} | Descrição: ${p.description}`);
    });

    // Busca nas variações
    const { data: variations, error: vError } = await supabase
        .from('product_variations')
        .select('*, products(description)')
        .ilike('name', '%COR:%');

    if (!vError && variations) {
        console.log(`\nEncontradas ${variations.length} variações com "COR:":`);
        variations.forEach(v => {
            console.log(`- ID: ${v.id} | Nome: ${v.name} | SKU: ${v.sku} | Pai: ${(v.products as any)?.description}`);
        });
    }

    process.exit(0);
}

search().catch(console.error);
