import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- PEOPLE TABLE ---');
    const { data: people, error: pError } = await supabase
        .from('people')
        .select('id, full_name, person_type, position, email, deleted')
        .or('full_name.ilike.%Caio%,full_name.ilike.%Creusa%');

    if (pError) console.error('Error fetching people:', pError);
    else console.log(JSON.stringify(people, null, 2));

    console.log('\n--- PROFILES TABLE ---');
    const { data: profiles, error: prError } = await supabase
        .from('profiles')
        .select('id, full_name, position, email')
        .or('full_name.ilike.%Caio%,full_name.ilike.%Creusa%');

    if (prError) console.error('Error fetching profiles:', prError);
    else console.log(JSON.stringify(profiles, null, 2));
}

debug();
