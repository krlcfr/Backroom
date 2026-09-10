const fs = require('fs');

let content = fs.readFileSync('components/workflows/WorkflowBuilderModal.tsx', 'utf8');

// 1. Imports
content = content.replace(
  'import WorkflowSidebar, { Cargo } from "./WorkflowSidebar";',
  'import WorkflowSidebar, { Cargo } from "./WorkflowSidebar";\nimport SignersSummaryModal from "./SignersSummaryModal";\nimport DocumentSignatureCanvas from "../documents/DocumentSignatureCanvas";'
);

// 2. Remove final_node
content = content.replace(
  /const \[nodes, setNodes, onNodesChange\] = useNodesState<Node>\(\[\s*\{\s*id: 'final_node',[\s\S]*?deletable: false,\s*\}\s*\]\);/,
  'const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);'
);

// 3. Add states
content = content.replace(
  'const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);',
  `const [step, setStep] = useState<'builder' | 'sign_summary' | 'sign_canvas'>('builder');
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [signNodes, setSignNodes] = useState<any[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);`
);

// 4. markerEnd
content = content.replace(
  /markerEnd: \{\s*type: MarkerType\.ArrowClosed,\s*width: 20,\s*height: 20,\s*color: '#7c3aed',\s*\},/,
  ''
);

// 5. handleCargoClick
const handleCargoStr = `
  const handleCargoClick = useCallback(
    (cargo: Cargo) => {
      if (!reactFlowInstance) return;

      const realNodes = nodes;
      let yPos = 100;
      let xPos = 250;
      
      if (realNodes.length > 0) {
        const lastNode = realNodes[realNodes.length - 1];
        yPos = lastNode.position.y + 150;
        xPos = lastNode.position.x;
      }

      const uniqueId = \`node_\${cargo.id}_\${Date.now()}\`;
      const newNode: Node = {
        id: uniqueId,
        type: 'cargo',
        position: { x: xPos, y: yPos },
        data: { 
          label: cargo.nombre, 
          cargoId: cargo.id, 
          action_required: 'approve',
          assigned_user_id: '',
          fullName: 'Cualquiera con este cargo'
        },
      };

      setNodes((nds) => {
        const updated = nds.concat(newNode);
        
        if (realNodes.length > 0) {
          const lastNode = realNodes[realNodes.length - 1];
          const newEdge: Edge = {
            id: \`edge_\${lastNode.id}-\${newNode.id}\`,
            source: lastNode.id,
            target: newNode.id,
            type: 'custom',
            animated: true,
            data: { type: 'approve' },
            style: { strokeWidth: 2, stroke: '#7c3aed' },
          };
          setEdges((eds) => eds.concat(newEdge));
        }

        return updated;
      });
    },
    [nodes, reactFlowInstance, setNodes, setEdges]
  );
`;

content = content.replace(
  'const onNodeClick: NodeMouseHandler = (event, node) => {',
  handleCargoStr + '\n  const onNodeClick: NodeMouseHandler = (event, node) => {'
);

// 6. Sidebar & Canvas wrappers
content = content.replace(
  '<WorkflowSidebar cargos={availableCargos} onDragStart={onDragStart} />',
  '<WorkflowSidebar cargos={availableCargos} onDragStart={onDragStart} onCargoClick={handleCargoClick} />'
);

content = content.replace(
  'deleteKeyCode={[\'Backspace\', \'Delete\']}\n                  fitView',
  'deleteKeyCode={[\'Backspace\', \'Delete\']}\n                  fitView\n                  fitViewOptions={{ maxZoom: 1 }}'
);

// 7. Render steps
content = content.replace(
  '{/* Header */}',
  '{step === \'builder\' && (\n          <>\n        {/* Header */}'
);

content = content.replace(
  /<\/aside>\n\s*\)\}\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\);\n\}/,
  `            </aside>
          )}
        </div>
        </>
        )}

        {step === 'sign_summary' && workflowData && (
          <SignersSummaryModal
            signNodes={signNodes}
            onProceed={() => setStep('sign_canvas')}
            onCancel={() => {
              if (onSaveWorkflow) onSaveWorkflow(workflowData);
              onClose();
            }}
          />
        )}

        {step === 'sign_canvas' && workflowData && (
          <DocumentSignatureCanvas
            workflowData={workflowData}
            signNodes={signNodes}
            onCancel={() => {
              if (onSaveWorkflow) onSaveWorkflow(workflowData);
              onClose();
            }}
            onComplete={() => {
              if (onSaveWorkflow) onSaveWorkflow(workflowData);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}`
);

// 8. handleSave workflow logic
content = content.replace(
  /const workflowData = await res\.json\(\);\n\s*alert\("¡Flujo guardado y asignado con éxito!"\);\n\s*if \(onSaveWorkflow\) \{\n\s*onSaveWorkflow\(workflowData\);\n\s*\}/,
  `const respData = await res.json();
      
      const firmantes = parsedNodes.filter(n => n.action_required === 'sign');
      if (firmantes.length > 0) {
        setWorkflowData(respData);
        setSignNodes(firmantes);
        setStep('sign_summary');
      } else {
        alert("¡Flujo guardado y asignado con éxito!");
        if (onSaveWorkflow) {
          onSaveWorkflow(respData);
        }
      }`
);

fs.writeFileSync('components/workflows/WorkflowBuilderModal.tsx', content);
console.log('Script done!');
