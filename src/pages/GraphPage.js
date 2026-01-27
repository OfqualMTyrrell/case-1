import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  Theme, Content, Grid, Column,
  ContentSwitcher, Switch,
  Dropdown, TextInput, Button, ButtonSet, Toggle, Layer, Tile, InlineLoading
} from '@carbon/react';
import { Download } from '@carbon/react/icons';
import { GraphCanvas, useSelection, lightTheme } from 'reagraph';

import AppHeader from '../components/AppHeader';
import raw from '../data/graph-data.json';

/* =========================
   Palette + Theme (IBM)
   ========================= */
// IBM color-blind-safe categorical palette (5 colors)
const IBM_CBLIND = ['#648FFF', '#785EF0', '#DC267F', '#FE6100', '#FFB000']; // IBM set
// Map each high-level category to an IBM color
const CATEGORY_COLORS = new Map([
  ['organisation', IBM_CBLIND[0]],
  ['scope', IBM_CBLIND[3]],
  ['qualification type', IBM_CBLIND[1]],
  ['qualification', IBM_CBLIND[2]],
]);

// White-background theme with IBM neutrals
const ibmLightTheme = {
  ...lightTheme,
  canvas: { background: '#FFFFFF', fog: '#FFFFFF' },
  node: {
    ...lightTheme.node,
    fill: '#A8A8A8',
    activeFill: '#525252',
    label: { ...lightTheme.node.label, color: '#161616', stroke: '#FFFFFF', activeColor: '#161616' },
    subLabel: { ...lightTheme.node.subLabel, color: '#525252', stroke: '#FFFFFF', activeColor: '#161616' }
  },
  edge: {
    ...lightTheme.edge,
    fill: '#C6C6C6',
    label: { ...lightTheme.edge.label, color: '#525252', stroke: '#FFFFFF' }
  },
  lasso: { border: '1px solid #78A9FF', background: 'rgba(120,169,255,0.08)' }
};

function colorForCategory(cat) {
  return CATEGORY_COLORS.get(cat) || '#6F6F6F';
}

/* Helpers */
const asCarbonItems = (arr) => arr.map(n => ({ id: n.id, label: n.label }));

/* =========================
   Component
   ========================= */
export default function GraphPage() {
  const graphRef = useRef(/** @type {React.MutableRefObject<GraphCanvasRef|null>} */(null));

  /* ---- Data state (we mutate this via helper panel; starts from JSON) ---- */
  const [data, setData] = useState(raw);           // { nodes, links }
  const [busy, setBusy] = useState(false);

  /* ---- Lens + focus ---- */
  const [lens, setLens] = useState('organisation'); // 'organisation' | 'type'
  const [focusId, setFocusId] = useState(null);     // orgId or typeId
  const [showAllLabels, setShowAllLabels] = useState(true); // fix for initial labels

  /* ---- Helper panel toggle ---- */
  const [helperOpen, setHelperOpen] = useState(false);

  /* ---- Derived graph (with colors) ---- */
  const { nodes, edges } = useMemo(() => {
    const nodes = (data.nodes ?? []).map(n => ({ ...n, fill: colorForCategory(n.category) }));
    const edges = (data.links ?? []).map((e, i) => {
  const id = e.id || `${String(e.source)}->${String(e.target)}:${e.type || ''}#${i}`;
  return { ...e, id, fill: '#C6C6C6' };
});
    return { nodes, edges };
  }, [data]);

  /* ---- Indexes ---- */
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

  /* ---- Subgraph extraction for lenses ---- */
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
    return { nodes: nodes.filter(n => keepNodes.has(n.id)), edges: keepEdges };
  }, [nodes, edges, out, byId]);

  const extractTypeView = useCallback((typeId) => {
    if (!typeId) return { nodes, edges };
    const keepNodes = new Set([typeId]);
    const keepEdges = [];
    (incomingByTarget.get(typeId) || []).forEach(e => {
      if (e.type === 'FOR_TYPE') {
        const scopeId = e.source;
        keepNodes.add(scopeId); keepEdges.push(e);
        (incomingByTarget.get(scopeId) || []).forEach(back => {
          if (back.type === 'HAS_SCOPE') { keepNodes.add(back.source); keepEdges.push(back); }
        });
        (out.get(scopeId) || []).forEach(e2 => {
          if (e2.type === 'INCLUDES') { keepNodes.add(e2.target); keepEdges.push(e2); }
        });
      }
    });
    return { nodes: nodes.filter(n => keepNodes.has(n.id)), edges: keepEdges };
  }, [nodes, edges, out, incomingByTarget]);

  const subgraph = useMemo(() => {
    if (!focusId) return { nodes, edges };
    return lens === 'organisation' ? extractOrganisationView(focusId) : extractTypeView(focusId);
  }, [lens, focusId, nodes, edges, extractOrganisationView, extractTypeView]);

  /* ---- Reagraph selection ---- */
  const { selections, actives, onNodeClick: selOnNodeClick, onCanvasClick } = useSelection({
    ref: graphRef, nodes: subgraph.nodes, edges: subgraph.edges
  });

  /* ---- Click → set lens focus ---- */
  const onNodeClick = useCallback((node /* InternalGraphNode */) => {
    const cat = node?.category || byId[node?.id]?.category;
    if (cat === 'organisation') { setLens('organisation'); setFocusId(node.id); }
    else if (cat === 'qualification type') { setLens('type'); setFocusId(node.id); }
    selOnNodeClick?.(node);
  }, [selOnNodeClick, byId]);

  const clearFocus = useCallback(() => setFocusId(null), []);

  /* =================================================
     Helper panel state + actions (create scope & qual)
     ================================================= */
  const orgItems  = useMemo(() => asCarbonItems(nodes.filter(n => n.category === 'organisation')), [nodes]);
  const typeItems = useMemo(() => asCarbonItems(nodes.filter(n => n.category === 'qualification type')), [nodes]);

  const [orgItem, setOrgItem] = useState(null);
  const [typeItem, setTypeItem] = useState(null);
  const [eventName, setEventName] = useState('Current scope');
  const [qualLabel, setQualLabel] = useState('');

  // utility ids
  const ensureUniqueId = (baseId) => {
    if (!byId[baseId]) return baseId;
    let i = 1;
    while (byId[`${baseId}-${i}`]) i += 1;
    return `${baseId}-${i}`;
  };

  const ensureScope = useCallback(async () => {
    if (!orgItem || !typeItem) return;
    setBusy(true);
    try {
      // does scope exist?
      const existing = (data.nodes || []).find(n =>
        n.category === 'scope' &&
        n.orgId === orgItem.id &&
        n.typeId === typeItem.id &&
        (n.event || 'Current scope') === (eventName || 'Current scope')
      );
      if (existing) {
        // also ensure links exist
        const alreadyHasScope = (data.links || []).some(l => l.source === orgItem.id && l.target === existing.id && l.type === 'HAS_SCOPE');
        const alreadyForType  = (data.links || []).some(l => l.source === existing.id && l.target === typeItem.id && l.type === 'FOR_TYPE');
        const links = [...(data.links || [])];
        if (!alreadyHasScope) links.push({ source: orgItem.id, target: existing.id, type: 'HAS_SCOPE' });
        if (!alreadyForType)  links.push({ source: existing.id, target: typeItem.id, type: 'FOR_TYPE' });
        if (!alreadyHasScope || !alreadyForType) setData({ ...data, links });
        return existing.id;
      }
      // create new scope node + links
      const scopeId = ensureUniqueId(`s-${orgItem.id}-${typeItem.id}`);
      const orgLabel  = byId[orgItem.id]?.label || orgItem.id;
      const typeLabel = byId[typeItem.id]?.label || typeItem.id;
      const label = `${eventName || 'Current scope'} (${orgLabel} × ${typeLabel})`;

      const newNode = { id: scopeId, label, category: 'scope', event: eventName || 'Current scope', orgId: orgItem.id, typeId: typeItem.id };
      const links   = [...(data.links || []), { source: orgItem.id, target: scopeId, type: 'HAS_SCOPE' }, { source: scopeId, target: typeItem.id, type: 'FOR_TYPE' }];
      const nodesN  = [...(data.nodes || []), newNode];
      setData({ nodes: nodesN, links });
      return scopeId;
    } finally {
      setBusy(false);
    }
  }, [data, orgItem, typeItem, eventName, byId]);

  const addQualification = useCallback(async () => {
    if (!qualLabel.trim()) return;
    if (!orgItem || !typeItem) return;
    setBusy(true);
    try {
      const scopeId = await ensureScope();
      if (!scopeId) return;
      // create a new qualification node + INCLUDES edge
      const qId = ensureUniqueId(`q-${Date.now().toString(36)}`);
      const newQ = { id: qId, label: qualLabel.trim(), category: 'qualification' };
      const nodesN = [...(data.nodes || []), newQ];
      const linksN = [...(data.links || []), { source: scopeId, target: qId, type: 'INCLUDES' }];
      setData({ nodes: nodesN, links: linksN });
      setQualLabel('');
      // Optional: focus on the org lens after creation
      setLens('organisation'); setFocusId(orgItem.id);
    } finally {
      setBusy(false);
    }
  }, [qualLabel, ensureScope, data, orgItem, typeItem]);

  const downloadJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'graph-data.updated.json';
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  /* ---- Render ---- */
  return (
    <Theme theme="white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ width: '100%', margin: '0 auto', flex: 1, padding: 0, paddingTop: '1em' }}>
        <Grid fullWidth columns={16} mode="narrow" gutter={16}>
          <Column sm={8} md={12} lg={16}>
            <div style={{ height: '100vh', position: 'relative' }}>

              {/* Top Controls: lens switcher, labels toggle, helper toggle (Carbon) */}
              <Layer style={{ position: 'absolute', zIndex: 10, top: 16, left: 16 }}>
                <Tile style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ContentSwitcher
                    size="md"
                    selectedIndex={lens === 'organisation' ? 0 : 1}
                    onChange={({ name }) => setLens(name)}
                  >
                    <Switch name="organisation" text="Organisation" />
                    <Switch name="type"          text="Qualification type" />
                  </ContentSwitcher>

                  <Toggle
                    id="toggle-labels"
                    labelText="Show all labels"
                    size="sm"
                    toggled={showAllLabels}
                    onToggle={(v) => setShowAllLabels(v)}
                  />

                  <Button kind="secondary" size="sm" onClick={clearFocus}>Clear focus</Button>
                  <Button
                    kind={helperOpen ? 'danger' : 'primary'}
                    size="sm"
                    onClick={() => setHelperOpen(o => !o)}
                  >
                    {helperOpen ? 'Hide helper panel' : 'Show helper panel'}
                  </Button>

                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={Download}
                    onClick={downloadJSON}
                    title="Download updated JSON"
                  >
                    Download
                  </Button>
                </Tile>
              </Layer>

              {/* Helper panel (hideable) */}
              {helperOpen && (
                <Layer style={{ position: 'absolute', zIndex: 9, top: 84, left: 16, width: 420 }}>
                  <Tile style={{ padding: 16 }}>
                    <h4 style={{ margin: '0 0 12px' }}>Helper panel</h4>

                    <div style={{ display: 'grid', gap: 12 }}>
                      <Dropdown
                        id="org-dd"
                        titleText="Organisation"
                        label="Choose organisation"
                        items={orgItems}
                        selectedItem={orgItem}
                        itemToString={(i) => i?.label ?? ''}
                        onChange={({ selectedItem }) => setOrgItem(selectedItem)}
                      />
                      <Dropdown
                        id="type-dd"
                        titleText="Qualification type"
                        label="Choose qualification type"
                        items={typeItems}
                        selectedItem={typeItem}
                        itemToString={(i) => i?.label ?? ''}
                        onChange={({ selectedItem }) => setTypeItem(selectedItem)}
                      />
                      <TextInput
                        id="event-name"
                        labelText="Event name"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="e.g., Current scope"
                      />

                      <ButtonSet>
                        <Button kind="secondary" onClick={ensureScope} disabled={!orgItem || !typeItem || busy}>
                          {busy ? <InlineLoading description="Ensuring scope..." /> : 'Create/ensure scope'}
                        </Button>

                        <TextInput
                          id="qual-label"
                          labelText="New qualification label"
                          placeholder="Enter qualification label"
                          value={qualLabel}
                          onChange={(e) => setQualLabel(e.target.value)}
                        />

                        <Button kind="primary" onClick={addQualification} disabled={!orgItem || !typeItem || !qualLabel.trim() || busy}>
                          {busy ? <InlineLoading description="Adding qualification..." /> : 'Add qualification to scope'}
                        </Button>
                      </ButtonSet>
                    </div>
                  </Tile>
                </Layer>
              )}

              {/* Graph */}
              <GraphCanvas
                ref={graphRef}
                theme={ibmLightTheme}
                nodes={subgraph.nodes}
                edges={subgraph.edges}
                selections={selections}
                actives={actives}
                layoutType="forceDirected2d"
                labelType={showAllLabels ? 'all' : 'auto'}
                edgeArrowPosition="mid"
                onNodeClick={onNodeClick}
                onCanvasClick={onCanvasClick}
                edgeInterpolation="curved"
                aggregateEdges={false}
              />
            </div>
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}