import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request) {
  // Removed ": Request"
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json(
      {
        error: 'Server Configuration Error: Missing Supabase Credentials'
      },
      { status: 500 }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Parse URL to get search params
  const { searchParams } = new URL(request.url);
  const servingTime = searchParams.get('serving_time');

  // Example query
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('serving_time', servingTime);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
