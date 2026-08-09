import "dotenv/config";
import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables in server/.env');
}

export function createSupabaseClient(token?: string) {
  const options: SupabaseClientOptions<any> = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  };

  if (token) {
    options.accessToken = async () => token;
  }

  const supabase = createClient(supabaseUrl!, supabaseKey!, options);

  return supabase;
}
