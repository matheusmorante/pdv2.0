import { createClient } from '@supabase/supabase-client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('c:/Users/mathe/OneDrive/Área de Trabalho/projetos/moveismorantehub/apps/erp/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .limit(1);

  if (error) {
    console.log("Error or table does not exist:", error.message);
  } else {
    console.log("Table exists! Found rows:", data.length);
  }
}

checkTable();
