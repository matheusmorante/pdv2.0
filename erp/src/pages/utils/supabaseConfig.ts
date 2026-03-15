import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured = supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://')

if (!isConfigured) {
  console.warn("⚠️ Supabase environment variables are missing (VITE_SUPABASE_URL/KEY). Using dummy client.");
}

// Helper for chainable dummy
const createDummyQuery = () => {
    const query: any = {
        select: () => query,
        order: () => query,
        eq: () => query,
        ilike: () => query,
        limit: () => query,
        then: (fn: any) => Promise.resolve(fn({ data: [], error: null })),
        catch: () => query
    };
    return query;
};

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : ({
      from: () => createDummyQuery(),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithOAuth: () => { 
            alert("Erro: O sistema não está configurado. Cadastre as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel da Vercel.");
            return Promise.resolve({ data: null, error: new Error('Not configured') });
        },
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      storage: {
        from: () => ({
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        })
      }
    } as any);
