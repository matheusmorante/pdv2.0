import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('c:/Users/mathe/OneDrive/Área de Trabalho/projetos/moveismorantehub/apps/erp/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
      console.log('ERROR:', error.message);
    } else {
      const keys = Object.keys(data[0] || {});
      console.log('COLS:', keys.join(', '));
    }
  } catch (e) {
    console.log('EXCEPTION:', e.message);
  }
}
check();
