import { createClient } from "@supabase/supabase-js";

const isMissingKeys = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "public-anon-key-placeholder";

const logger = (globalThis as any).console;

if (isMissingKeys) {
  if (logger) logger.warn("Supabase URL ou Key não encontrados em .env. Por favor, configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
}

if (logger) logger.log('[Supabase] Initializing client with URL:', supabaseUrl);
export const supabase = createClient(supabaseUrl, supabaseKey);
if (logger) logger.log('[Supabase] Client created.');
