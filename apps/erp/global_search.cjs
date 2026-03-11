const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function globalSearch() {
    const term = 'joseana';
    const tables = ['orders', 'people', 'products', 'attendance_logs', 'categories', 'suppliers', 'inventory_movements'];
    
    console.log(`Global search for: "${term}"`);
    
    for (const table of tables) {
        try {
            console.log(`Searching table: ${table}...`);
            const { data, error } = await supabase.from(table).select('*');
            
            if (error) {
                if (error.message.includes('not found') || error.message.includes('does not exist')) {
                    continue;
                }
                console.error(`Error in ${table}:`, error.message);
                continue;
            }
            
            if (data) {
                const matches = data.filter(row => {
                    return JSON.stringify(row).toLowerCase().includes(term);
                });
                
                if (matches.length > 0) {
                    console.log(`MATCH FOUND in ${table}: ${matches.length} rows`);
                    matches.forEach(m => console.log(JSON.stringify(m, null, 2)));
                }
            }
        } catch (e) {
            console.error(`Exception searching ${table}:`, e.message);
        }
    }
}

globalSearch();
