
import React, { useMemo, useRef, useState, useCallback } from 'react';
import { GraphCanvas, useSelection, GraphCanvasRef, lightTheme } from 'reagraph';
import { Content, Grid, Column, Theme } from '@carbon/react';
import AppHeader from '../components/AppHeader';
import raw from '../data/graph-data.json';

// IBM color-blind-safe categorical palette (5 colors)
const IBM_CBLIND = ['#648FFF', '#785EF0', '#DC267F', '#FE6100', '#FFB000'];

// Map each high-level category to a distinct color from the IBM set
const CATEGORY_COLORS = new Map([
  ['organisation', IBM_CBLIND[0]],
  ['scope',        IBM_CBLIND[3]],
  ['qualification type', IBM_CBLIND[1]],
  ['qualification', IBM_CBLIND[2]],
]);

// White-background theme with IBM neutrals for legible labels
const ibmLightTheme = {
  ...lightTheme,
  canvas: { background: '#FFFFFF', fog: '#FFFFFF' },
  node: {
    ...lightTheme.node,
    fill: '#A8A8A8',
    activeFill: '#525252',
    label: {
      ...lightTheme.node.label,
      color: '#161616',
      stroke: '#FFFFFF',
      activeColor: '#161616'
    },
    subLabel: {
      ...lightTheme.node.subLabel,
      color: '#525252',
      stroke: '#FFFFFF',
      activeColor: '#161616'
    }
  },
  edge: {
    ...lightTheme.edge,
    fill: '#C6C6C6',
    label: {
      ...lightTheme.edge.label,
      color: '#525252',
      stroke: '#FFFFFF'
    }
  },
  lasso: {
    border: '1px solid #78A9FF',
    background: 'rgba(120,169,255,0.08)'
  }
};

function colorForCategory(cat) {
  return CATEGORY_COLORS.get(cat) || '#6F6F6F'; // gray fallback
}

export default function GraphPage() {
  const graphRef = useRef(/** @type {React.MutableRefObject<GraphCanvasRef|null>} */(null));

  // Normalize & colorize
  const { nodes, edges } = useMemo(() => {
    const nodes = (raw.nodes ?? []).map(n => ({
      ...n,
      fill: colorForCategory(n.category)
    }));

    // Default neutral edges; keep provided fields such as label/type
    const edges = (raw.links ?? []).map(e => ({ ...e, fill: '#C6C6C6' }));
    return { nodes, edges };
  }, []);

  // --- Lens selection ---
  const [lens, setLens] = useState('organisation'); // 'organisation' | 'type'
  const [focusId, setFocusId] = useState(null);      // selected orgId or typeId

  // Indexes for subgraph extraction
  const byId = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);
  const out = useMemo(() => {
    const m = new Map();
    edges.forEach(e => {
      if (!m.has(e.source)) m.set(e.source, []);
      m.get(e.source).push(e);
    });
    return m;
  }, [edges]);
  const incomingByTarget = useMemo(() => {
    const m = new Map();
    edges.forEach(e => {
      if (!m.has(e.target)) m.set(e.target, []);
      m.get(e.target).push(e);
    });
    return m;
  }, [edges]);

  // Extract org-focused view: org -> scopes -> type + qualifications
  const extractOrganisationView = useCallback((orgId) => {
    if (!orgId) return { nodes, edges };
    const keepNodes = new Set([orgId]);
    const keepEdges = [];

    (out.get(orgId) || []).forEach(e => {
      const scopeId = e.target; // HAS_SCOPE
      if (byId[scopeId]?.category === 'scope') {
        keepNodes.add(scopeId); keepEdges.push(e);
        (out.get(scopeId) || []).forEach(e2 => {
          const tgt = e2.target;
          if (byId[tgt]?.category === 'qualification type' && e2.type === 'FOR_TYPE') {
            keepNodes.add(tgt); keepEdges.push(e2);
          }
          if (byId[tgt]?.category === 'qualification' && e2.type === 'INCLUDES') {
            keepNodes.add(tgt); keepEdges.push(e2);
          }
        });
      }
    });

    return {
      nodes: nodes.filter(n => keepNodes.has(n.id)),
      edges: keepEdges
    };
  }, [nodes, edges, out, byId]);

  // Extract type-focused view: type <- scopes <- org ; scopes -> qualifications
  const extractTypeView = useCallback((typeId) => {
    if (!typeId) return { nodes, edges };
    const keepNodes = new Set([typeId]);
    const keepEdges = [];

    // scopes that point to this type via FOR_TYPE
    (incomingByTarget.get(typeId) || []).forEach(e => {
      if (e.type === 'FOR_TYPE') {
        const scopeId = e.source;
        keepNodes.add(scopeId); keepEdges.push(e);

        // orgs owning the scope
        (incomingByTarget.get(scopeId) || []).forEach(back => {
          if (back.type === 'HAS_SCOPE') {
            keepNodes.add(back.source); keepEdges.push(back);
          }
        });

        // qualifications included by this scope
        (out.get(scopeId) || []).forEach(e2 => {
          if (e2.type === 'INCLUDES') {
            keepNodes.add(e2.target); keepEdges.push(e2);
          }
        });
      }
    });

    return {
      nodes: nodes.filter(n => keepNodes.has(n.id)),
      edges: keepEdges
    };
  }, [nodes, edges, out, incomingByTarget]);

  const subgraph = useMemo(() => {
    if (!focusId) return { nodes, edges };
    return lens === 'organisation' ? extractOrganisationView(focusId)
                                   : extractTypeView(focusId);
  }, [lens, focusId, nodes, edges, extractOrganisationView, extractTypeView]);

  // Selection helpers from Reagraph
  const { selections, actives, onNodeClick: selOnNodeClick, onCanvasClick } = useSelection({
    ref: graphRef, nodes: subgraph.nodes, edges: subgraph.edges
  });

  // When a node is clicked, also drive the lens focus
  const onNodeClick = useCallback((node /* InternalGraphNode */) => {
    const cat = node?.category || byId[node?.id]?.category;
    if (cat === 'organisation') {
      setLens('organisation');
      setFocusId(node.id);
    } else if (cat === 'qualification type') {
      setLens('type');
      setFocusId(node.id);
    }
    selOnNodeClick?.(node);
  }, [selOnNodeClick, byId]);

  const clearFocus = useCallback(() => setFocusId(null), []);

  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
          <Grid fullWidth columns={16} mode="narrow" gutter={16}>
            <Column sm={8} md={12} lg={16} className="cds--lg:col-start-4">
              <div style={{ height: '100vh', position: 'relative' }}>
                {/* Simple lens controls */}
                <div style={{ position: 'absolute', zIndex: 10, top: 32, left: 12, background: '#fff', padding: '8px 12px', borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <strong>Lens:</strong>
                    <button onClick={() => setLens('organisation')} style={{ padding: '4px 8px', background: lens==='organisation' ? '#e0e7ff' : '#f4f4f4' }}>Organisation</button>
                    <button onClick={() => setLens('type')} style={{ padding: '4px 8px', background: lens==='type' ? '#e0e7ff' : '#f4f4f4' }}>Qualification type</button>
                    <button onClick={clearFocus} style={{ marginLeft: 8, padding: '4px 8px' }}>Clear focus</button>
                    {focusId && <span style={{ marginLeft: 8, color: '#6f6f6f' }}>focused: {byId[focusId]?.label || focusId}</span>}
                  </div>
                </div>

                <GraphCanvas
                  ref={graphRef}
                  theme={ibmLightTheme}
                  nodes={subgraph.nodes}
                  edges={subgraph.edges}
                  selections={selections}
                  actives={actives}
                  layoutType="forceDirected2d"
                  labelType="auto"
                  edgeArrowPosition="mid"
                  onNodeClick={onNodeClick}
                  onCanvasClick={onCanvasClick}
                />
              </div>
            </Column>
        </Grid>
      </Content>
    </Theme>
  );
}
