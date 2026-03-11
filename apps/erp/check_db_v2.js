import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('c:/Users/mathe/OneDrive/Área de Trabalho/projetos/moveismorantehub/apps/erp/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (error) {
    console.log("Error fetching products:", error.message);
  } else {
    const columns = Object.keys(data[0] || {});
    console.log("Product columns:", columns.join(', '));
    console.log("Has is_draft?", columns.includes('is_draft'));
  }

  const { data: logs, error: logError } = await supabase
    .from('attendance_logs')
    .select('*')
    .limit(1);

  if (logError) {
    console.log("Error fetching attendance_logs:", logError.message);
  } else {
    console.log("attendance_logs table exists!");
  }
}

checkColumns();
