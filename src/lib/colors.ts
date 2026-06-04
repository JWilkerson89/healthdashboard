// Styling-side color tokens. These are CSS-variable *references* — the active
// theme preset sets the actual hex via :root variables (see ThemeRegistry +
// themes.ts), so anything styled with these switches instantly when the theme
// changes. For chart series colors use `useTheme().accents[key]` instead, since
// d3-color (MUI X Charts) can't parse `var(...)`.

export const ACCENT = {
  hrv: 'var(--acc-hrv)',
  sleep: 'var(--acc-sleep)',
  rhr: 'var(--acc-rhr)',
  steps: 'var(--acc-steps)',
  battery: 'var(--acc-battery)',
  stress: 'var(--acc-stress)',
  spo2: 'var(--acc-spo2)',
  load: 'var(--acc-load)',
  calories: 'var(--acc-calories)',
} as const;

export const MACRO = {
  protein: 'var(--mac-protein)',
  fat: 'var(--mac-fat)',
  carbs: 'var(--mac-carbs)',
} as const;

// Keyed maps resolve any string key to its var reference (with a grey fallback
// so an unknown key never produces an invalid CSS value).
function varMap(prefix: string) {
  return new Proxy({} as Record<string, string>, {
    get: (_t, k) => (typeof k === 'string' ? `var(--${prefix}-${k}, #8b949e)` : undefined),
  });
}

export const STATUS = varMap('st');
export const PRIORITY = varMap('pr');
export const CATEGORY = varMap('cat');
