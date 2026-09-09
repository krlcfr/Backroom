"use client";

import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';

export const CustomWorkflowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: any) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className="bg-[#1e2020] border border-[#3f3f46] text-[#e2e2e2] text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 shadow-lg cursor-pointer hover:border-[#7c3aed] transition-colors" title="Doble clic para eliminar">
            <span className="material-symbols-outlined text-[12px] text-[#7c3aed]">
              {data?.type === 'sign' ? 'draw' : data?.type === 'review' ? 'visibility' : 'verified'}
            </span>
            {data?.type === 'sign' ? 'Firma' : data?.type === 'review' ? 'Revisión' : 'Aprobación'}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
