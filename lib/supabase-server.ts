import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role key if available, otherwise fall back to anon key
const serverKey = (serviceRoleKey && serviceRoleKey.length > 10)
  ? serviceRoleKey
  : supabaseAnonKey;

export const supabaseServer = createClient(supabaseUrl, serverKey, {
  auth: { persistSession: false },
});
