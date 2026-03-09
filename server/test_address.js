import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'c:\\Users\\Rosilene\\Desktop\\pdv\\pdv\\.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase.from('people').select('id, full_name, address').order('created_at', { ascending: false }).limit(5);
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Latest Address Data:");
        data.forEach(p => {
            console.log(`\nID: ${p.id} - ${p.full_name}`);
            console.log(`Type of address:`, typeof p.address);
            console.log(`Value:`, p.address);
            if (typeof p.address === 'string') {
                try {
                    const parsed = JSON.parse(p.address);
                    console.log('Parsed successfully:', parsed);
                } catch (e) {
                    console.log('Failed to parse json');
                }
            }
        });
    }
}

run();
