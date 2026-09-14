const fs = require('fs');
const files = [
  'app/dashboard/auditoria/audit-table.tsx',
  'app/dashboard/backrooms/[id]/page.tsx', // missed this one
  'app/dashboard/backrooms/[id]/miembros/page.tsx',
  'app/dashboard/backrooms/[id]/salas/[salaId]/permisos/page.tsx',
  'app/dashboard/configuracion/configuracion-form.tsx',
  'app/dashboard/perfil/perfil-client.tsx',
  'app/org/crear/page.tsx',
  'components/documents/DocumentCreationWizardModal.tsx',
  'components/documents/DocumentSignatureCanvas.tsx',
  'components/layout/NotificationBell.tsx',
  'components/rooms/RoomsClient.tsx', // missed this one
  'components/salas/permissions/sala-permissions.tsx',
  'components/salas/recursos-list.tsx',
  'components/salas/resources/resources-grid.tsx',
  'components/workflows/ActiveWorkflowsModal.tsx',
  'components/workflows/WorkflowBuilderModal.tsx',
  'components/workflows/WorkflowStatusViewer.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log('Skipping ' + file);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('alert(')) {
    // Replace alert with toast
    content = content.replace(/\balert\(/g, 'toast(');
    
    // Add import if not present
    if (!content.includes('sonner')) {
      // Find the last import
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, nextLineIndex + 1) + 'import { toast } from \"sonner\";\n' + content.slice(nextLineIndex + 1);
      } else {
        content = 'import { toast } from \"sonner\";\n' + content;
      }
    }
    
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
}
