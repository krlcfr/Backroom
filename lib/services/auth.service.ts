import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/api-error";
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "@/lib/validations/schemas";

export class AuthService {
  static async register(input: RegisterInput) {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const { data: existingUsername } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("username", input.username)
      .maybeSingle();

    if (existingUsername) {
      throw new ApiError(409, "El nombre de usuario ingresado ya se encuentra en uso", "username");
    }

    const { data: existingEmail } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("correo", input.email)
      .maybeSingle();

    if (existingEmail) {
      throw new ApiError(409, "El correo electrónico ingresado ya se encuentra registrado", "email");
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (authError || !authData.user) {
      throw new ApiError(400, "No se pudo completar el registro");
    }

    const { error: insertError } = await supabaseAdmin.from("usuarios").insert({
      auth_id: authData.user.id,
      username: input.username,
      nombre_completo: input.username,
      correo: input.email,
    });

    if (insertError) {
      throw new ApiError(500, "No se pudo completar el registro");
    }

    return { id: authData.user.id, username: input.username, email: input.email };
  }

  static async login(input: LoginInput) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.user) {
      throw new ApiError(401, "Correo electrónico o contraseña incorrectos");
    }

    return { id: data.user.id, email: data.user.email };
  }

  static async logout() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new ApiError(500, "No se pudo cerrar la sesión");
    }
  }

  static async getProfile(authId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, username, nombre_completo, correo, es_superadmin, activo, created_at")
      .eq("auth_id", authId)
      .single();

    if (error || !data) {
      throw new ApiError(404, "Perfil no encontrado");
    }

    return data;
  }

  static async forgotPassword(input: ForgotPasswordInput) {
    const supabase = await createClient();

    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/recuperar/confirmar`;

    const { error } = await supabase.auth.resetPasswordForEmail(input.email, { redirectTo });

    if (error) {
      throw new ApiError(400, "No se pudo enviar el correo de recuperación");
    }
  }

  static async resetPassword(input: ResetPasswordInput) {
    const supabase = await createClient();

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(input.code);

    if (exchangeError) {
      throw new ApiError(400, "El enlace de recuperación no es válido o ha expirado");
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: input.password });

    if (updateError) {
      throw new ApiError(500, "No se pudo restablecer la contraseña");
    }

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      throw new ApiError(500, "No se pudo cerrar la sesión");
    }
  }
}
