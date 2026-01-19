
import React, { useMemo, useRef } from 'react';
import { GraphCanvas, useSelection, GraphCanvasRef } from 'reagraph';
import AppHeader from '../components/AppHeader';
import raw from '../data/graph-data.json';

import { IBM_CBLIND, makeOrdinalColorer } from '../graph-themes/IBMPalette';
import { ibmLightTheme } from '../graph-themes/IBMReagraphTheme';

const GraphPage = () => {
  const graphRef = useRef/** @type {React.MutableRefObject<GraphCanvasRef|null>} */(null);

  // Normalize to Reagraph's nodes/edges
  const { nodes, edges } = useMemo(() => {
    const nodes = (raw.nodes ?? []).map(n => ({ ...n }));
    const edges = (raw.links ?? raw.edges ?? []).map((e, i) => {
      const src = typeof e.source === 'object' ? e.source.id : e.source;
      const tgt = typeof e.target === 'object' ? e.target.id : e.target;
      return { id: e.id ?? `${src}-${tgt}-${i}`, source: src, target: tgt, label: e.label ?? e.type ?? undefined, ...e };
    });
    return { nodes, edges };
  }, [raw]);

  // Choose the property that defines a node's category (primary label / type / group)
  const getCategoryKey = (n) =>
    (Array.isArray(n.labels) && n.labels[0]) || n.type || n.group || 'uncategorized';

  // Create an ordinal color mapper using IBM's color-blind-safe palette
  const colorFor = useMemo(() => makeOrdinalColorer(IBM_CBLIND), []);

  // Assign per-node categorical colors & neutral edges by default
  const colorizedNodes = useMemo(
    () => nodes.map(n => ({ ...n, fill: colorFor(getCategoryKey(n)) })),
    [nodes, colorFor]
  );

  const neutralEdges = useMemo(
    () => edges.map(e => ({ ...e, fill: '#C6C6C6' })), // Gray 30 as default edge color
    [edges]
  );

  // Selection handling (click to select, click-outside to clear)
  const { selections, actives, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef, nodes: colorizedNodes, edges: neutralEdges
  });

  return (
    <div className="page">
      <AppHeader />
      <div className="content-area" style={{ height: '100vh' }}>
        <GraphCanvas
          ref={graphRef}
          theme={ibmLightTheme}
          nodes={colorizedNodes}
          edges={neutralEdges}
          selections={selections}
          actives={actives}
          layoutType="forceDirected2d"
          labelType="auto"
          edgeArrowPosition="mid"
          onNodeClick={onNodeClick}
          onCanvasClick={onCanvasClick}
        />
      </div>
    </div>
  );
};

export default GraphPage;
