import { createAdminClient } from "../lib/supabase/admin";

async function seedSuperAdmin() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Faltan SUPERADMIN_EMAIL y SUPERADMIN_PASSWORD en .env.local");
    return;
  }

  const supabaseAdmin = createAdminClient();

  // Buscar si el usuario ya existe en auth
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  let authUser = users.users.find(u => u.email === email);

  if (!authUser) {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError || !authData.user) {
      console.error("No se pudo crear el usuario en Supabase Auth:", authError?.message);
      return;
    }
    authUser = authData.user;
  }

  // Buscar o crear perfil en usuarios
  let { data: userData } = await supabaseAdmin.from("usuarios").select().eq("correo", email).maybeSingle();
  
  if (!userData) {
    const { data: newUserData, error: insertError } = await supabaseAdmin.from("usuarios").insert({
      auth_id: authUser.id,
      username: "superadmin",
      nombre_completo: "Super Administrador",
      correo: email,
      es_superadmin: true,
    }).select().single();
    if (insertError) return console.error(insertError);
    userData = newUserData;
  } else {
    // Asegurar que sea superadmin
    await supabaseAdmin.from("usuarios").update({ es_superadmin: true }).eq("id", userData.id);
  }

  // Crear organizacion Enterprise para el superadmin
  let { data: orgData } = await supabaseAdmin.from("organizations").select().eq("owner_id", userData.id).maybeSingle();

  if (!orgData) {
    const { data: newOrgData, error: orgError } = await supabaseAdmin.from("organizations").insert({
      name: "Administración Central",
      owner_id: userData.id,
      plan: "enterprise"
    }).select().single();

    if (orgError) {
      console.error("No se pudo crear la organización enterprise:", orgError.message);
    } else {
      orgData = newOrgData;
      // Vincularlo como miembro activo (Admin)
      await supabaseAdmin.from("organization_members").insert({
        organization_id: orgData.id,
        user_id: userData.id,
        role: "admin",
        status: "active"
      });
    }
  } else {
    // Asegurarnos que tenga el plan enterprise
    await supabaseAdmin.from("organizations").update({ plan: "enterprise" }).eq("id", orgData.id);
  }

  console.log("SuperAdmin configurado correctamente con plan Enterprise:", email);
}

seedSuperAdmin();
