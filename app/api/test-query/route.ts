import { createAdminClient } from '@/lib/supabase/admin';

async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('workflow_nodes')
    .select('id, document_workflows!inner(id, title, status, recursos!inner(id, nombre, sala_id, salas!inner(backroom_id)))')
    .eq('status', 'pending')
    .limit(1);
    
  console.log(JSON.stringify({ data, error }, null, 2));
}
GET();
