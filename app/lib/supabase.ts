import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', anonKey ? '✓ Set' : '✗ Missing');
  console.error('Please add these to your Vercel Environment Variables');
}

export const supabaseServer = supabaseUrl && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

// For client-side operations
export const createSupabaseClient = () => {
  if (!supabaseUrl || !anonKey) {
    throw new Error('Supabase environment variables are not configured');
  }
  return createClient(supabaseUrl, anonKey);
};
