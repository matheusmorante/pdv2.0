import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Starting...");
    try {
        const { data, error } = await supabase.from('orders').select('*').order('id', { ascending: false }).limit(200);
        if (error) {
            fs.writeFileSync('result_alessandra.json', JSON.stringify({ error }));
            return;
        }
        const filtered = data.filter(o => JSON.stringify(o.order_data).includes('Alessandra'));
        fs.writeFileSync('result_alessandra.json', JSON.stringify(filtered, null, 2));
        console.log("Done!");
    } catch (e) {
        fs.writeFileSync('result_alessandra.json', JSON.stringify({ exception: e.message }));
    }
}
run();
