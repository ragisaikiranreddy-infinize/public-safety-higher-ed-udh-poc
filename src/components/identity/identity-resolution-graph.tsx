/**
 * <IdentityResolutionGraph personId /> — Person Master Record at center,
 * source identifiers radiating in a circle. Edge styling encodes match
 * method (solid = deterministic-exact, dashed = fuzzy / probabilistic;
 * amber when confidence < 80).
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
import { IdentifierNode, type IdentifierNodeData } from './identifier-node';
import { personIdentitySubgraph } from '@/lib/mock-db';

const NODE_TYPES: NodeTypes = { idn: IdentifierNode };

const CENTER_X = 400;
const CENTER_Y = 200;
const RADIUS = 220;

export function IdentityResolutionGraph({
  personId,
  className,
}: {
  personId: string;
  className?: string;
}) {
  const { nodes, edges } = useMemo(() => {
    const sub = personIdentitySubgraph(personId);
    const idCount = sub.nodes.filter((n) => n.kind === 'identifier').length;

    const rfNodes: Node<IdentifierNodeData>[] = sub.nodes.map((n) => {
      if (n.kind === 'person') {
        return {
          id: n.id,
          type: 'idn',
          position: { x: CENTER_X - 100, y: CENTER_Y - 30 },
          data: {
            kind: 'person',
            label: n.label,
          },
        };
      }
      // Place identifier nodes around a circle.
      const idIndex = sub.nodes.filter((x) => x.kind === 'identifier').findIndex((x) => x.id === n.id);
      const theta = (2 * Math.PI * idIndex) / Math.max(1, idCount) - Math.PI / 2;
      return {
        id: n.id,
        type: 'idn',
        position: {
          x: CENTER_X + RADIUS * Math.cos(theta) - 90,
          y: CENTER_Y + RADIUS * Math.sin(theta) - 24,
        },
        data: {
          kind: 'identifier',
          label: n.label,
          source: n.source,
          confidence: n.confidence,
          matchMethod: n.matchMethod,
          classification: n.classification,
        },
      };
    });

    const rfEdges: Edge[] = sub.edges.map((e, i) => {
      const n = sub.nodes.find((x) => x.id === e.from);
      const isProbabilistic = n?.matchMethod === 'probabilistic';
      const isFuzzy = n?.matchMethod === 'deterministic-fuzzy';
      const conf = n?.confidence ?? 100;
      const stroke =
        conf < 80 ? 'var(--signal-amber)' :
        isProbabilistic ? 'var(--hub-500)' :
        isFuzzy ? 'var(--graphite-500)' :
        'var(--graphite-700)';
      return {
        id: `e-${i}-${e.from}-${e.to}`,
        source: e.from,
        target: e.to,
        type: 'straight',
        animated: isProbabilistic,
        style: {
          stroke,
          strokeWidth: 1.5,
          strokeDasharray: isProbabilistic ? '4 4' : isFuzzy ? '6 3' : undefined,
        },
        label: conf < 100 ? `${conf}%` : undefined,
        labelStyle: { fontSize: 10, fill: 'var(--muted-foreground)' },
        labelBgStyle: { fill: 'var(--background)' },
      };
    });

    return { nodes: rfNodes, edges: rfEdges };
  }, [personId]);

  return (
    <div className={className} style={{ height: 420 }}>
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
