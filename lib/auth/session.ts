import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/api-error";

export async function getSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return null;
  }

  return data.session.user;
}

export async function requireAuth() {
  const user = await getSession();

  if (!user) {
    throw new ApiError(401, "No autenticado");
  }

  return user;
}
