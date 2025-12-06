// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// 1) URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('Supabase URL missing: set NEXT_PUBLIC_SUPABASE_URL');
}

// 2) PUBLIC / BROWSER KEY (for client + getStaticProps)
const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// 3) SERVER KEY (preferred: service role, fallback to public)
const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY || publicKey;

if (!serverKey) {
  // If we get here, NOTHING is set; fail loudly (better than "supabaseKey is required")
  throw new Error(
    'Supabase key missing: set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY'
  );
}

// Client instance (browser usage + getStaticProps)
export const supabase = createClient(
  supabaseUrl,
  publicKey || serverKey // in the worst case we reuse serverKey
);

// Server instance (API routes, server code, workers)
export const getServerSupabase = () =>
  createClient(supabaseUrl, serverKey, {
    auth: { persistSession: false }
  });
