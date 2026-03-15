const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function partialSearch() {
    const terms = ['jose', 'ana', 'joze'];
    const tables = ['orders', 'people', 'attendance_logs'];
    
    console.log(`Partial search for: ${terms.join(', ')}`);
    
    for (const table of tables) {
        try {
            console.log(`Searching table: ${table}...`);
            const { data, error } = await supabase.from(table).select('*');
            
            if (error) {
                console.error(`Error in ${table}:`, error.message);
                continue;
            }
            
            if (data) {
                const results = [];
                data.forEach(row => {
                    const rowStr = JSON.stringify(row).toLowerCase();
                    terms.forEach(term => {
                        if (rowStr.includes(term)) {
                            results.push({ term, row });
                        }
                    });
                });
                
                if (results.length > 0) {
                    console.log(`MATCHES FOUND in ${table}: ${results.length}`);
                    // Print unique matches
                    const uniqueMatches = Array.from(new Set(results.map(r => JSON.stringify(r.row))));
                    uniqueMatches.slice(0, 10).forEach(m => {
                        const parsed = JSON.parse(m);
                        const name = parsed.full_name || parsed.full_name || parsed.order_data?.customerData?.fullName || parsed.customer_name || 'N/A';
                        console.log(`Match: ${name} (ID: ${parsed.id})`);
                    });
                    if (uniqueMatches.length > 10) console.log(`... and ${uniqueMatches.length - 10} more.`);
                }
            }
        } catch (e) {
            console.error(`Exception searching ${table}: ${e.message}`);
        }
    }
}

partialSearch();
