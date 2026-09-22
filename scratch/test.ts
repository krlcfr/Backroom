import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from("usuarios").select("*").limit(1).then(() => {
  // Try calling postgres function or directly query if we have a way.
  // Actually, we can just look at Supabase Dashboard or query pg_policies using postgres connection.
});
