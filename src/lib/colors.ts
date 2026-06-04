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

// Consult trend status colors.
export const STATUS: Record<string, string> = {
  critical: '#ff5252',
  worsening: '#ff5252',
  warning: '#ffb74d',
  elevated: '#ffb74d',
  low: '#ffd54f',
  normal: '#69f0ae',
  improving: '#69f0ae',
};

// Recommendation priority colors.
export const PRIORITY: Record<string, string> = {
  critical: '#ff5252',
  high: '#ffb74d',
  normal: '#58a6ff',
  low: '#8b949e',
};

// Health-journal category colors.
export const CATEGORY: Record<string, string> = {
  consultation: '#58a6ff',
  supplement: '#4dd0e1',
  calorie_trend: '#ffb74d',
  lab_reminder: '#7c4dff',
  observation: '#69f0ae',
  intervention: '#ff5252',
  strategy: '#ba68c8',
};
