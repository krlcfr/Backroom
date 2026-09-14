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
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { global: { fetch: customFetch } }
);

async function run() {
  const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@demo.com',
    password: 'password123'
  });
  
  if (authError) {
    console.log("Login error:", authError);
    return;
  }
  
  const { data, error } = await supabase
    .from('document_workflows')
    .select(`
      id,
      organization_id,
      status,
      created_at,
      document_id,
      recursos(nombre)
    `)
    .in('status', ['draft', 'in_progress', 'under_review'])
    .order('created_at', { ascending: false });
    
  console.log("Workflows for admin@backroom.app:", data?.length, "error:", error);
}

run();
