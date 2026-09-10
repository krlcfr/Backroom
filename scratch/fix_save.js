const fs = require('fs');
let c = fs.readFileSync('components/workflows/WorkflowBuilderModal.tsx', 'utf8');
c = c.replace(/const workflowData = await res\.json\(\);[\s\S]*?if \(onSaveWorkflow\) \{[\s\S]*?\}/, `
const respData = await res.json();
const firmantes = parsedNodes.filter(n => n.action_required === 'sign');
if (firmantes.length > 0) {
  setWorkflowData(respData);
  setSignNodes(firmantes);
  setStep('sign_summary');
} else {
  alert("Flujo guardado con éxito!");
  if (onSaveWorkflow) {
    onSaveWorkflow(respData);
  }
}`);
fs.writeFileSync('components/workflows/WorkflowBuilderModal.tsx', c);
