const fs = require('fs');
const lines = fs.readFileSync('components/workflows/WorkflowBuilderModal.tsx', 'utf8').split('\n');
const content = lines.slice(0, 293).join('\n');
const newRender = `  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[120] backdrop-blur-sm">
      <div className="bg-[#121414] w-[95vw] h-[95vh] rounded-2xl border border-[#3f3f46] shadow-2xl flex flex-col overflow-hidden">
        
        {step === 'builder' && (
          <>
            {/* Header */}
            <div className="h-16 px-6 border-b border-[#3f3f46] flex items-center justify-between shrink-0 bg-[#1a1c1c]">
              <h2 className="text-[18px] font-semibold text-[#e2e2e2] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c3aed]">account_tree</span>
                Constructor de Mapa Mental {documentTitle ? \`- \${documentTitle}\` : ''}
              </h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleSave}
                  disabled={nodes.length === 0}
                  className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
                >
                  Guardar y Asignar Flujo
                </button>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333535] text-[#958da1] hover:text-[#e2e2e2] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Cargos */}
              <WorkflowSidebar cargos={availableCargos} onDragStart={onDragStart} onCargoClick={handleCargoClick} />

              {/* Flow Canvas */}
              <main className="flex-1 relative" ref={reactFlowWrapper}>
                <ReactFlowProvider>
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onEdgeDoubleClick={(_, edge) => setEdges(eds => eds.filter(e => e.id !== edge.id))}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    deleteKeyCode={['Backspace', 'Delete']}
                    fitView
                    fitViewOptions={{ maxZoom: 1 }}
                    className="bg-[#0c0f0f]"
                  >
                    <Background color="#3f3f46" gap={16} />
                    <Controls className="bg-[#27272a] border-[#3f3f46] fill-white" />
                  </ReactFlow>
                </ReactFlowProvider>
              </main>

              {/* Sidebar Configuración (Right) */}
              {selectedNode && (
                <aside className="w-80 border-l border-[#3f3f46] bg-[#18181b] p-4 flex flex-col gap-4 overflow-y-auto">
                  <div className="flex flex-col gap-4 animate-in slide-in-from-right-2 duration-200">
                    <div className="flex items-center gap-2 mb-2">
                      <button 
                        onClick={() => setSelectedNodeId(null)}
                        className="text-[#958da1] hover:text-[#e2e2e2] flex items-center"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                      <h3 className="text-sm font-semibold text-[#e2e2e2] uppercase tracking-wider">
                        Configurar Nodo
                      </h3>
                    </div>

                    <div className="bg-[#27272a] p-4 rounded-xl border border-[#3f3f46]">
                      <p className="text-sm font-medium text-white mb-1">Cargo: {selectedNode.data.label}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#958da1]">Acción Requerida</label>
                      <select 
                        className="bg-[#27272a] border border-[#3f3f46] text-white text-sm rounded-lg p-2.5 outline-none focus:border-[#7c3aed]"
                        value={selectedNode.data.action_required || 'approve'}
                        onChange={(e) => {
                          updateNodeData(selectedNode.id, { action_required: e.target.value });
                        }}
                      >
                        <option value="approve">Aprobar</option>
                        <option value="sign">Firmar</option>
                        <option value="review">Solo Revisar</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#958da1]">Persona Específica</label>
                      <select 
                        className="bg-[#27272a] border border-[#3f3f46] text-white text-sm rounded-lg p-2.5 outline-none focus:border-[#7c3aed]"
                        value={selectedNode.data.assigned_user_id || ''}
                        onChange={(e) => {
                          const user = eligibleMembers.find(m => m.userId === e.target.value);
                          updateNodeData(selectedNode.id, { 
                            assigned_user_id: e.target.value,
                            fullName: user ? user.fullName : 'Cualquiera con este cargo',
                            avatar: null
                          });
                        }}
                      >
                        <option value="">Cualquiera con este cargo</option>
                        {eligibleMembers.map(m => (
                          <option key={m.userId} value={m.userId}>{m.fullName}</option>
                        ))}
                      </select>
                      {eligibleMembers.length === 0 && (
                        <p className="text-[10px] text-yellow-500 mt-1">No hay usuarios con este cargo.</p>
                      )}
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={() => deleteNode(selectedNode.id)}
                        className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Eliminar Paso
                      </button>
                    </div>
                  </div>
                </aside>
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
}`;
fs.writeFileSync('components/workflows/WorkflowBuilderModal.tsx', content + '\n' + newRender);
