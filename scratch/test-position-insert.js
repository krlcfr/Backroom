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
  const { data: wfData } = await supabase
    .from('document_workflows')
    .select('id, document_id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!wfData) {
    console.error("No workflow found");
    return;
  }

  console.log("Found workflow:", wfData.id);

  const { data: nodes } = await supabase
    .from('workflow_nodes')
    .select('id, assigned_user_id')
    .eq('workflow_id', wfData.id);

  if (!nodes || nodes.length === 0) {
    console.error("No nodes found");
    return;
  }

  const testPos = {
    workflow_id: wfData.id,
    resource_id: wfData.document_id,
    workflow_node_id: nodes[0].id,
    assigned_user_id: nodes[0].assigned_user_id,
    page_number: 1,
    pos_x_percent: 10,
    pos_y_percent: 10,
    width_px: 150,
    height_px: 60,
    is_signed: false
  };

  console.log("Inserting:", testPos);

  const { error } = await supabase
    .from('workflow_signature_positions')
    .insert([testPos]);

  if (error) {
    console.error("ERROR INSERTING:", error);
  } else {
    console.log("SUCCESSFULLY INSERTED");
  }
}

run();
