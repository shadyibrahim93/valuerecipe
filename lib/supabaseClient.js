import { createClient } from '@supabase/supabase-js';

// --------- SHARED URL ---------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL for Supabase');
}

// --------- BROWSER / PUBLIC CLIENT ---------
const browserKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!browserKey && process.env.NODE_ENV === 'development') {
  // In dev, fail fast so you notice missing vars
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY'
  );
}

// This is what you use in pages/components/getStaticProps
export const supabase = createClient(supabaseUrl, browserKey);

// --------- SERVER CLIENT (API routes, edge, workers) ---------
export const getServerSupabase = () => {
  const serverKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!serverKey) {
    throw new Error(
      'Supabase server client missing key. Set SUPABASE_SERVICE_ROLE_KEY (recommended) or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return createClient(supabaseUrl, serverKey, {
    auth: { persistSession: false }
  });
};
