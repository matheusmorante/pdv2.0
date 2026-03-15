const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    const { data: products } = await supabase.from('products').select('id, description, code, active, deleted').ilike('description', '%CHILE%');
    fs.writeFileSync('check_chile.json', JSON.stringify(products || [], null, 2));
    process.exit(0);
}

check().catch(e => {
    fs.writeFileSync('check_chile_error.txt', e.message);
    process.exit(1);
});
