'use client';
import { createTheme } from '@mui/material/styles';

// Dark, calm health-dashboard palette. Single source for accent colors used
// by charts so summary tiles and graphs stay visually consistent.
export const ACCENT = {
  hrv: '#7c4dff',
  sleep: '#4fc3f7',
  rhr: '#ff5252',
  steps: '#69f0ae',
  battery: '#ffd54f',
  stress: '#ff8a65',
  spo2: '#4dd0e1',
  load: '#ba68c8',
} as const;

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0d1117', paper: '#161b22' },
    primary: { main: '#58a6ff' },
    secondary: { main: '#7c4dff' },
    divider: 'rgba(255,255,255,0.08)',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.06)' },
      },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
  },
});

export default theme;
