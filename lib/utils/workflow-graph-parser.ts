import { Node, Edge } from '@xyflow/react';

export interface ParsedNode {
  reactFlowId: string;
  cargo_id: string;
  assigned_user_id?: string;
  node_type: 'linear' | 'parallel' | 'final';
  action_required: 'sign' | 'approve' | 'review';
  step_order: number;
}

export function parseFlowToSteps(
  nodes: Node[],
  edges: Edge[]
): { parsedNodes: ParsedNode[]; errors: string[] } {
  const errors: string[] = [];

  if (nodes.length === 0) {
    return { parsedNodes: [], errors: ["El flujo está vacío. Agrega al menos un nodo."] };
  }

  // 1. Build adjacency list and in-degree map
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  edges.forEach(edge => {
    if (!adjacencyList.has(edge.source) || !adjacencyList.has(edge.target)) {
      return; // edge references non-existent node
    }
    adjacencyList.get(edge.source)!.push(edge.target);
    inDegree.set(edge.target, inDegree.get(edge.target)! + 1);
  });

  // 2. Identify root nodes (inDegree === 0)
  let currentLayer: string[] = [];
  nodes.forEach(node => {
    if (inDegree.get(node.id) === 0) {
      currentLayer.push(node.id);
    }
  });

  if (currentLayer.length === 0 && nodes.length > 0) {
    errors.push("El flujo no puede tener ciclos y necesita al menos un punto de inicio.");
    return { parsedNodes: [], errors };
  }

  // 3. BFS (Kahn's algorithm) to assign step_order layer by layer
  const parsedNodesMap = new Map<string, ParsedNode>();
  let currentStepOrder = 1;
  let visitedCount = 0;

  while (currentLayer.length > 0) {
    const nextLayer: string[] = [];
    const isParallel = currentLayer.length > 1;

    for (const nodeId of currentLayer) {
      visitedCount++;
      const node = nodes.find(n => n.id === nodeId)!;
      const outgoingCount = adjacencyList.get(nodeId)!.length;

      // Extract data (fallback to defaults if not set yet by UI)
      const data = node.data as Record<string, any>;
      const action_required = data.action_required || 'approve';
      const assigned_user_id = data.assigned_user_id || undefined;
      const cargo_id = data.cargoId || ''; // assuming 'cargoId' is set in UI

      let node_type: 'linear' | 'parallel' | 'final' = isParallel ? 'parallel' : 'linear';
      if (outgoingCount === 0) {
        node_type = 'final';
      }

      parsedNodesMap.set(nodeId, {
        reactFlowId: nodeId,
        cargo_id,
        assigned_user_id,
        node_type,
        action_required,
        step_order: currentStepOrder,
      });

      // Decrease in-degree for children
      const children = adjacencyList.get(nodeId)!;
      for (const childId of children) {
        const newDegree = inDegree.get(childId)! - 1;
        inDegree.set(childId, newDegree);
        if (newDegree === 0) {
          nextLayer.push(childId);
        }
      }
    }

    // Deduplicate next layer because multiple nodes in currentLayer might point to same child
    currentLayer = Array.from(new Set(nextLayer));
    currentStepOrder++;
  }

  if (visitedCount !== nodes.length) {
    // Some nodes were not visited -> there's a cycle or disconnected component
    const unvisited = nodes.filter(n => !parsedNodesMap.has(n.id));
    // If they have in-degree > 0 but weren't visited, it's a cycle
    const hasCycle = unvisited.some(n => inDegree.get(n.id)! > 0);
    
    if (hasCycle) {
      errors.push("Se detectó un ciclo en el flujo. Las tareas deben ser secuenciales.");
    } else {
      errors.push("Hay nodos desconectados en el flujo. Asegúrate de conectar todos los pasos.");
    }
  }

  // Check if any parsed node is missing required fields
  const parsedNodes = Array.from(parsedNodesMap.values());
  const missingCargo = parsedNodes.some(pn => !pn.cargo_id);
  if (missingCargo) {
    errors.push("Algunos nodos no tienen un cargo asignado.");
  }

  return { parsedNodes, errors };
}
