const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    try {
        const { data: groups } = await supabase.from('category_groups').select('id, name');
        const { data: cats } = await supabase.from('categories').select('id, name');
        const { data: links } = await supabase.from('category_group_links').select('group_id, category_id');
        const { data: suppliers } = await supabase.from('people').select('id, full_name').eq('person_type', 'suppliers');

        console.log('--- GROUPS ---');
        console.log(JSON.stringify(groups));
        console.log('--- CATS ---');
        console.log(JSON.stringify(cats));
        console.log('--- LINKS ---');
        console.log(JSON.stringify(links));
        console.log('--- SUPPLIERS ---');
        console.log(JSON.stringify(suppliers));
    } catch (e) {
        console.error(e);
    }
}
run();
