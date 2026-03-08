import { createClient } from "@supabase/supabase-js";

const isMissingKeys = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "public-anon-key-placeholder";

if (isMissingKeys) {
  console.warn("Supabase URL ou Key não encontrados em .env. Por favor, configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
