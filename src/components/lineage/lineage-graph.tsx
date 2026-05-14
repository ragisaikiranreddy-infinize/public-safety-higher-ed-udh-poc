/**
 * <LineageGraph datasetId={...} /> — xyflow Bronze → Silver → Gold lineage
 * subgraph centered on a focus dataset (one-hop upstream + downstream).
 *
 * Manual layout (per reference POCs): Bronze x=0, Silver x=360, Gold x=720.
 * Smoothstep edges; focus node gets a hub-azure ring.
 */
import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DatasetNode, type DatasetNodeData } from './dataset-node';
import { lineageSubgraph } from '@/lib/mock-db';
import type { MedallionLayer } from '@/lib/types';

const NODE_TYPES: NodeTypes = { dataset: DatasetNode };

const LAYER_X: Record<MedallionLayer, number> = {
  bronze: 40,
  silver: 360,
  gold: 680,
};

interface Props {
  datasetId: string;
  className?: string;
}

export function LineageGraph({ datasetId, className }: Props) {
  const { nodes, edges } = useMemo(() => {
    const subgraph = lineageSubgraph(datasetId);
    // Bucket by layer for vertical stacking within each column.
    const byLayer: Record<MedallionLayer, typeof subgraph.nodes> = {
      bronze: [],
      silver: [],
      gold: [],
    };
    for (const n of subgraph.nodes) byLayer[n.layer].push(n);

    const rfNodes: Node<DatasetNodeData>[] = [];
    (['bronze', 'silver', 'gold'] as MedallionLayer[]).forEach((layer) => {
      byLayer[layer].forEach((n, idx) => {
        rfNodes.push({
          id: n.id,
          type: 'dataset',
          position: { x: LAYER_X[layer], y: 40 + idx * 100 },
          data: {
            datasetId: n.id,
            layer: n.layer,
            name: n.name,
            isFocus: n.isFocus,
          },
        });
      });
    });

    const rfEdges: Edge[] = subgraph.edges.map((e, i) => ({
      id: `e-${i}-${e.from}-${e.to}`,
      source: e.from,
      target: e.to,
      type: 'smoothstep',
      animated: e.from === datasetId || e.to === datasetId,
      style: { stroke: 'var(--graphite-400)' },
    }));

    return { nodes: rfNodes, edges: rfEdges };
  }, [datasetId]);

  return (
    <div className={className} style={{ height: 360 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
      >
        <Background gap={20} size={1} color="var(--graphite-200)" />
        <Controls showInteractive={false} className="!bg-[var(--card)] !shadow-sm" />
      </ReactFlow>
    </div>
  );
}
