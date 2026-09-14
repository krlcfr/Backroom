
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
  const { data, error } = await supabase
    .from('document_workflows')
    .select(`
      id,
      status,
      created_at,
      document_id,
      recursos(nombre),
      workflow_nodes(
        id,
        type,
        status,
        step_order,
        usuarios!workflow_nodes_assigned_user_id_fkey(nombre_completo)
      )
    `)
    .limit(1);

  if (error) {
    console.error('ERROR:', error);
  } else {
    console.log('SUCCESS:', JSON.stringify(data, null, 2));
  }
}
run();

