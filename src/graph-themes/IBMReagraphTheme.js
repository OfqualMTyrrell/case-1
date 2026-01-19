
// colors/ibmReagraphTheme.js
import { lightTheme } from 'reagraph';

export const ibmLightTheme = {
  ...lightTheme,
  canvas: {
    background: '#FFFFFF', // IBM White
    fog: '#FFFFFF'
  },
  node: {
    ...lightTheme.node,
    // Default/fallback fill if a node doesn't get a categorical color:
    fill: '#A8A8A8',              // Gray 40 (subtle fallback)
    activeFill: '#525252',        // Gray 70 on hover/active for contrast
    label: {
      ...lightTheme.node.label,
      color: '#161616',           // Gray 100 for strong text
      stroke: '#FFFFFF',          // white halo for contrast on lines
      activeColor: '#161616'
    },
    subLabel: {
      ...lightTheme.node.subLabel,
      color: '#525252',           // Gray 70 secondary
      stroke: '#FFFFFF',
      activeColor: '#161616'
    }
  },
  edge: {
    ...lightTheme.edge,
    fill: '#C6C6C6',              // Gray 30 for neutral edges
    activeFill: '#525252',        // Gray 70 when edge is active/selected
    label: {
      ...lightTheme.edge.label,
      color: '#525252',           // Gray 70
      stroke: '#FFFFFF'           // keep labels readable on light lines
    }
  },
  lasso: {
    border: '1px solid #78A9FF',  // Blue 40 outline (subtle)
    background: 'rgba(120,169,255,0.08)'
  }
};
