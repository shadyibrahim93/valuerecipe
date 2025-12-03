import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// helper for server-side (use only in api routes)
export const getServerSupabase = (
  serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
) => {
  return createClient(supabaseUrl, serviceKey);
};
