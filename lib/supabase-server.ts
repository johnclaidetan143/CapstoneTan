import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServerKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (
  !process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY === "your_supabase_service_role_key_here"
) {
  throw new Error("Missing valid SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

export const supabaseServer = createClient(supabaseUrl, supabaseServerKey);
