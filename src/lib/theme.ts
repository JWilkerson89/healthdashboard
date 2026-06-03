'use client';
import { createTheme } from '@mui/material/styles';

// Accent chart colors live in '@/lib/colors' (a plain module) so Server
// Components get real values, not client-reference proxies.

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
