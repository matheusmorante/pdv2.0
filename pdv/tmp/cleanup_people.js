import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    console.log('--- CLEANING UP PEOPLE POSITIONS ---');

    // Select those with empty string positions
    const { data: people, error: selectError } = await supabase
        .from('people')
        .select('id, full_name, position')
        .eq('position', '');

    if (selectError) {
        console.error('Error selecting people:', selectError);
        return;
    }

    console.log(`Found ${people.length} records with empty string position.`);

    if (people.length > 0) {
        for (const person of people) {
            console.log(`Updating ${person.full_name} (ID: ${person.id})...`);
            const { error: updateError } = await supabase
                .from('people')
                .update({ position: null })
                .eq('id', person.id);

            if (updateError) {
                console.error(`Error updating ID ${person.id}:`, updateError);
            }
        }
    }

    console.log('Cleanup finished.');
}

cleanup();
