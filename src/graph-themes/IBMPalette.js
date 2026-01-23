export const IBM_CBLIND = [
  '#648FFF', // Ultramarine
  '#785EF0', // Indigo
  '#DC267F', // Magenta
  '#FE6100', // Orange
  '#FFB000'  // Gold
];

// Deterministic ordinal color assignment for any string key
export function makeOrdinalColorer(palette = IBM_CBLIND) {
  const cache = new Map();
  return function colorFor(key) {
    if (!cache.has(key)) {
      cache.set(key, palette[cache.size % palette.length]);
    }
    return cache.get(key);
  };
}
