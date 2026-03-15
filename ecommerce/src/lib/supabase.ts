import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we have valid environment variables
const isConfigured = 
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseUrl !== 'undefined'

if (!isConfigured) {
  console.warn("⚠️ Supabase environment variables are missing or invalid. Using dummy client for build resilience.");
}

// Helper to create a chainable dummy query object
const createDummyQuery = () => {
  const query: any = {
    select: () => query,
    order: () => query,
    eq: () => query,
    ilike: () => query,
    limit: () => query,
    range: () => query,
    single: () => query,
    maybeSingle: () => query,
    // Support for both .then() (await) and manual call
    then: (fn: any) => Promise.resolve(fn({ data: [], error: null })),
    catch: () => query,
    finally: () => query,
  };
  return query;
};

// Create a real client only if configured, otherwise provide a dummy object
// This avoids the "supabaseUrl is required" error during Vercel builds
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : ({
      from: () => createDummyQuery(),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: new Error('Not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
          list: () => Promise.resolve({ data: [], error: null }),
        })
      }
    } as any)
