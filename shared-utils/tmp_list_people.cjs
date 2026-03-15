const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listPeople() {
    const { data: people, error } = await supabase
        .from('people')
        .select('id, full_name, nickname, is_draft')
        .limit(100);
    
    if (error) console.error(error);
    else {
        console.log("People list:");
        people.forEach(p => console.log(`- ${p.full_name} (${p.nickname}) ID: ${p.id} Draft: ${p.is_draft}`));
    }
}

listPeople();
