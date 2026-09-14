import { WorkflowHistoryTimeline } from "./WorkflowHistoryTimeline";

interface WorkflowHistoryModalProps {
  workflowId: string;
  onClose: () => void;
}

export function WorkflowHistoryModal({ workflowId, onClose }: WorkflowHistoryModalProps) {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0 z-0" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-3xl bg-[#1e2020] border border-[#3f3f46] rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-[#3f3f46]">
          <h3 className="text-[#e2e2e2] font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c3aed]">history</span>
            Bitácora del Documento
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#333535] hover:bg-[#4a4455] text-[#ccc3d8] transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <WorkflowHistoryTimeline workflowId={workflowId} />
        </div>
      </div>
    </div>
  );
}

