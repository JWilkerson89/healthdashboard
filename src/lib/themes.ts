import { createTheme, type Theme } from '@mui/material/styles';

// ---- Token shape ----
// Every preset defines the same token groups. Styling reads these as CSS
// variables (see colors.ts); charts read the real hex off the MUI theme
// (theme.accents) via useTheme(), because d3-color can't parse var().

export type AccentKey =
  | 'hrv' | 'sleep' | 'rhr' | 'steps' | 'battery' | 'stress' | 'spo2' | 'load' | 'calories';

export interface Tokens {
  palette: {
    bg: string;
    paper: string;
    primary: string;
    secondary: string;
    divider: string;
    textPrimary: string;
    textSecondary: string;
  };
  accents: Record<AccentKey, string>;
  status: Record<string, string>;
  priority: Record<string, string>;
  category: Record<string, string>;
  macro: Record<string, string>;
  effects: {
    radius: number;
    mono: boolean; // monospace overline/labels
    cardBg: string;
    cardBorder: string;
    glow: string; // box-shadow applied to accent surfaces ('' = none)
    appBg: string; // body background (may be a gradient)
  };
}

export interface Preset {
  label: string;
  tokens: Tokens;
}

const MONO = '"JetBrains Mono", "SF Mono", "Roboto Mono", ui-monospace, monospace';

// ---- Tactical Command (default) ----
const tactical: Tokens = {
  palette: {
    bg: '#0b0f14', paper: '#121821', primary: '#34d3ff', secondary: '#b98aff',
    divider: 'rgba(120,160,190,0.14)', textPrimary: '#e8f1f8', textSecondary: '#8aa0b2',
  },
  accents: {
    hrv: '#34d3ff', sleep: '#4aa8ff', rhr: '#ff3b3b', steps: '#36d399',
    battery: '#ffb000', stress: '#ff7a45', spo2: '#2ee6c5', load: '#b98aff', calories: '#ffb000',
  },
  status: {
    critical: '#ff3b3b', worsening: '#ff3b3b', warning: '#ffb000', elevated: '#ffb000',
    low: '#ffd166', normal: '#36d399', improving: '#36d399',
  },
  priority: { critical: '#ff3b3b', high: '#ffb000', normal: '#34d3ff', low: '#5a6b7b' },
  category: {
    consultation: '#34d3ff', supplement: '#2ee6c5', calorie_trend: '#ffb000',
    lab_reminder: '#b98aff', observation: '#36d399', intervention: '#ff3b3b', strategy: '#4aa8ff',
  },
  macro: { protein: '#34d3ff', fat: '#ffb000', carbs: '#ff7a45' },
  effects: {
    radius: 4, mono: true, cardBg: '#121821', cardBorder: 'rgba(120,160,190,0.16)',
    glow: '', appBg: '#0b0f14',
  },
};

// ---- Synthwave Neon ----
const synthwave: Tokens = {
  palette: {
    bg: '#0a0a16', paper: '#14142b', primary: '#ff2e97', secondary: '#00e5ff',
    divider: 'rgba(177,77,255,0.20)', textPrimary: '#f3e9ff', textSecondary: '#a08fc0',
  },
  accents: {
    hrv: '#b14dff', sleep: '#00e5ff', rhr: '#ff2e97', steps: '#2bd9a8',
    battery: '#ffd166', stress: '#ff7a45', spo2: '#00e5ff', load: '#b14dff', calories: '#ff9f1c',
  },
  status: {
    critical: '#ff2e97', worsening: '#ff2e97', warning: '#ffd166', elevated: '#ffd166',
    low: '#ff9f1c', normal: '#2bd9a8', improving: '#2bd9a8',
  },
  priority: { critical: '#ff2e97', high: '#ffd166', normal: '#00e5ff', low: '#6b5b95' },
  category: {
    consultation: '#00e5ff', supplement: '#2bd9a8', calorie_trend: '#ffd166',
    lab_reminder: '#b14dff', observation: '#2bd9a8', intervention: '#ff2e97', strategy: '#00e5ff',
  },
  macro: { protein: '#00e5ff', fat: '#ffd166', carbs: '#ff7a45' },
  effects: {
    radius: 10, mono: false, cardBg: 'rgba(20,20,43,0.85)', cardBorder: 'rgba(177,77,255,0.25)',
    glow: '0 0 18px rgba(255,46,151,0.25)',
    appBg: 'radial-gradient(1200px 600px at 80% -10%, #1b1040 0%, #0a0a16 55%)',
  },
};

// ---- Aurora Glass ----
const aurora: Tokens = {
  palette: {
    bg: '#0d1117', paper: 'rgba(255,255,255,0.05)', primary: '#2dd4bf', secondary: '#6366f1',
    divider: 'rgba(255,255,255,0.10)', textPrimary: '#eef2f7', textSecondary: '#9aa6b6',
  },
  accents: {
    hrv: '#6366f1', sleep: '#38bdf8', rhr: '#fb7185', steps: '#2dd4bf',
    battery: '#fbbf24', stress: '#fb923c', spo2: '#22d3ee', load: '#a78bfa', calories: '#f59e0b',
  },
  status: {
    critical: '#fb7185', worsening: '#fb7185', warning: '#fbbf24', elevated: '#fbbf24',
    low: '#f59e0b', normal: '#34d399', improving: '#34d399',
  },
  priority: { critical: '#fb7185', high: '#fbbf24', normal: '#38bdf8', low: '#64748b' },
  category: {
    consultation: '#38bdf8', supplement: '#2dd4bf', calorie_trend: '#fbbf24',
    lab_reminder: '#a78bfa', observation: '#34d399', intervention: '#fb7185', strategy: '#6366f1',
  },
  macro: { protein: '#22d3ee', fat: '#fbbf24', carbs: '#fb923c' },
  effects: {
    radius: 16, mono: false, cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.10)',
    glow: '0 8px 32px rgba(45,212,191,0.10)',
    appBg: 'radial-gradient(900px 500px at 15% -10%, #14302e 0%, #0d1117 50%), radial-gradient(900px 500px at 90% 10%, #1a1840 0%, transparent 55%)',
  },
};

// ---- Cyber Terminal ----
const cyber: Tokens = {
  palette: {
    bg: '#050807', paper: '#0a0f0a', primary: '#39ff14', secondary: '#ffb300',
    divider: 'rgba(57,255,20,0.18)', textPrimary: '#c8f7c0', textSecondary: '#6f9e66',
  },
  accents: {
    hrv: '#39ff14', sleep: '#00d4ff', rhr: '#ff3131', steps: '#39ff14',
    battery: '#ffb300', stress: '#ff7a00', spo2: '#00d4ff', load: '#c77dff', calories: '#ffb300',
  },
  status: {
    critical: '#ff3131', worsening: '#ff3131', warning: '#ffb300', elevated: '#ffb300',
    low: '#ffd000', normal: '#39ff14', improving: '#39ff14',
  },
  priority: { critical: '#ff3131', high: '#ffb300', normal: '#39ff14', low: '#4a6a45' },
  category: {
    consultation: '#00d4ff', supplement: '#39ff14', calorie_trend: '#ffb300',
    lab_reminder: '#c77dff', observation: '#39ff14', intervention: '#ff3131', strategy: '#00d4ff',
  },
  macro: { protein: '#00d4ff', fat: '#ffb300', carbs: '#ff7a00' },
  effects: {
    radius: 2, mono: true, cardBg: '#0a0f0a', cardBorder: 'rgba(57,255,20,0.22)',
    glow: '0 0 12px rgba(57,255,20,0.18)', appBg: '#050807',
  },
};

export const PRESETS: Record<string, Preset> = {
  tactical: { label: 'Tactical Command', tokens: tactical },
  synthwave: { label: 'Synthwave Neon', tokens: synthwave },
  aurora: { label: 'Aurora Glass', tokens: aurora },
  cyber: { label: 'Cyber Terminal', tokens: cyber },
};

export const DEFAULT_PRESET = 'tactical';

/** Flat { '--acc-hrv': '#...', ... } CSS-variable map for the active tokens. */
export function cssVars(t: Tokens): Record<string, string> {
  const v: Record<string, string> = {};
  for (const [k, val] of Object.entries(t.accents)) v[`--acc-${k}`] = val;
  for (const [k, val] of Object.entries(t.status)) v[`--st-${k}`] = val;
  for (const [k, val] of Object.entries(t.priority)) v[`--pr-${k}`] = val;
  for (const [k, val] of Object.entries(t.category)) v[`--cat-${k}`] = val;
  for (const [k, val] of Object.entries(t.macro)) v[`--mac-${k}`] = val;
  return v;
}

export function buildTheme(t: Tokens): Theme {
  return createTheme({
    palette: {
      mode: 'dark',
      background: { default: t.palette.bg, paper: t.palette.paper },
      primary: { main: t.palette.primary },
      secondary: { main: t.palette.secondary },
      divider: t.palette.divider,
      text: { primary: t.palette.textPrimary, secondary: t.palette.textSecondary },
      error: { main: t.status.critical },
      warning: { main: t.status.warning },
      success: { main: t.status.normal },
    },
    shape: { borderRadius: t.effects.radius },
    typography: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      overline: t.effects.mono
        ? { fontFamily: MONO, letterSpacing: '0.08em', fontWeight: 600 }
        : { letterSpacing: '0.08em' },
    },
    // Real hex tokens for charts (read via useTheme).
    accents: t.accents,
    status: t.status,
    priority: t.priority,
    category: t.category,
    macro: t.macro,
    effects: t.effects,
    components: {
      MuiPaper: { defaultProps: { elevation: 0 } },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: t.effects.cardBg,
            border: `1px solid ${t.effects.cardBorder}`,
            backdropFilter: t.palette.paper.startsWith('rgba') ? 'blur(12px)' : 'none',
            boxShadow: t.effects.glow || 'none',
          },
        },
      },
    },
  });
}

// ---- Module augmentation: typed custom tokens on the theme ----
declare module '@mui/material/styles' {
  interface Theme {
    accents: Record<AccentKey, string>;
    status: Record<string, string>;
    priority: Record<string, string>;
    category: Record<string, string>;
    macro: Record<string, string>;
    effects: Tokens['effects'];
  }
  interface ThemeOptions {
    accents?: Record<AccentKey, string>;
    status?: Record<string, string>;
    priority?: Record<string, string>;
    category?: Record<string, string>;
    macro?: Record<string, string>;
    effects?: Tokens['effects'];
  }
}
