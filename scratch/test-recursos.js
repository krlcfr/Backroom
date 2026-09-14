const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const fetch = require('node-fetch');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
});

const agent = new https.Agent({ family: 4 });
const customFetch = (url, init) => fetch(url, { ...init, agent });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { global: { fetch: customFetch } }
);

async function run() {
  const id = '21fa4c0f-9698-47f7-b10c-b933e9a08aa7';
  console.log(`Buscando recurso ${id}...`);
  
  const { data: resource, error } = await supabase
    .from("recursos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("ERROR:", error);
    return;
  }
  
  console.log("RECURSO ENCONTRADO:", resource);
}

run();
