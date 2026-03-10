const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wzpdfmihnwcrgkyagwkd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY');

async function run() {
    const [g, c, l] = await Promise.all([
        supabase.from('category_groups').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('category_group_links').select('*')
    ]);
    console.log(JSON.stringify({ groups: g.data, cats: c.data, links: l.data }, null, 2));
    process.exit(0);
}
run();
