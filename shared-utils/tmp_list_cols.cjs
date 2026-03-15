const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listColumns() {
    // Try to get one record to see columns
    const { data: people } = await supabase.from('people').select('*').limit(1);
    console.log("People columns:", Object.keys(people?.[0] || {}));

    const { data: orders } = await supabase.from('sales_orders').select('*').limit(1);
    console.log("Sales Orders columns:", Object.keys(orders?.[0] || {}));
}

listColumns();
