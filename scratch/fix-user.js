const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const fetch = require('node-fetch');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
});

// Forzar IPv4
const agent = new https.Agent({ family: 4 });
const customFetch = (url, init) => fetch(url, { ...init, agent });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: { fetch: customFetch }
});

async function run() {
  console.log("Buscando usuario admin@backroom.app...");
  
  // Buscar o actualizar un usuario de prueba
  const { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Error al listar usuarios:", error);
    return;
  }
  
  console.log("Usuarios encontrados:", users.users.map(u => u.email).join(', '));
  
  // Aqui le pondremos contrasea al primer usuario que encontremos o al que nos pida
}

run();
