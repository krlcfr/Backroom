import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/api-error";
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "@/lib/validations/schemas";

export class AuthService {
  static async register(input: RegisterInput) {
    const supabase = await createClient();

    const { data: existingUsername } = await supabase
      .from("usuarios")
      .select("id")
      .eq("username", input.username)
      .maybeSingle();

    if (existingUsername) {
      throw new ApiError(409, "El nombre de usuario ya esta en uso");
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (authError || !authData.user) {
      throw new ApiError(400, authError?.message ?? "No se pudo crear la cuenta");
    }

    const { error: insertError } = await supabase.from("usuarios").insert({
      auth_id: authData.user.id,
      username: input.username,
      nombre_completo: input.fullName,
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
      throw new ApiError(401, "Correo o contrasena incorrectos");
    }

    return { id: data.user.id, email: data.user.email };
  }

  static async logout() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new ApiError(500, "No se pudo cerrar la sesion");
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
      throw new ApiError(400, error.message ?? "Error al enviar el correo de recuperacion");
    }
  }

  static async resetPassword(input: ResetPasswordInput) {
    const supabase = await createClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: input.tokenHash,
      type: "recovery",
    });

    if (verifyError) {
      throw new ApiError(400, "El enlace de recuperacion es invalido o expiro");
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: input.password });

    if (updateError) {
      throw new ApiError(500, "No se pudo actualizar la contrasena");
    }
  }
}
