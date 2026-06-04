// Plain module (NOT 'use client') so Server Components import the real values.
// A 'use client' module's exports become client-reference proxies on the server,
// which would surface here as `undefined` colors — and a null color crashes
// MUI X Charts' area fill (d3Color(null).brighter()).
export const ACCENT = {
  hrv: '#7c4dff',
  sleep: '#4fc3f7',
  rhr: '#ff5252',
  steps: '#69f0ae',
  battery: '#ffd54f',
  stress: '#ff8a65',
  spo2: '#4dd0e1',
  load: '#ba68c8',
  calories: '#ffb74d',
} as const;

// Macronutrient colors, shared by the nutrition bar and legend.
export const MACRO = {
  protein: '#4dd0e1',
  fat: '#ffd54f',
  carbs: '#ff8a65',
} as const;
