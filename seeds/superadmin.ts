import { createAdminClient } from "../lib/supabase/admin";

async function seedSuperAdmin() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Faltan SUPERADMIN_EMAIL y SUPERADMIN_PASSWORD en .env.local");
    return;
  }

  const supabaseAdmin = createAdminClient();

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    console.error("No se pudo crear el usuario en Supabase Auth:", authError?.message);
    return;
  }

  const { error: insertError } = await supabaseAdmin.from("usuarios").insert({
    auth_id: authData.user.id,
    username: "superadmin",
    nombre_completo: "Super Administrador",
    correo: email,
    es_superadmin: true,
  });

  if (insertError) {
    console.error("No se pudo insertar el perfil del superadmin:", insertError.message);
    return;
  }

  console.log("SuperAdmin creado correctamente:", email);
}

seedSuperAdmin();
