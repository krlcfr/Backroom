import { createClient } from "@/lib/supabase/server";

export async function getSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function requireAuth() {
  const user = await getSession();

  if (!user) {
    throw new Error("No autenticado");
  }

  return user;
}
