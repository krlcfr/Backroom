import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/api-error";

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
    throw new ApiError(401, "No autenticado");
  }

  return user;
}
