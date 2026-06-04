'use client';
import { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { PRESETS, DEFAULT_PRESET, buildTheme, cssVars } from '@/lib/themes';

interface ThemeCtx {
  preset: string;
  setPreset: (p: string) => void;
  presets: { key: string; label: string }[];
}

const Ctx = createContext<ThemeCtx | null>(null);

export function useThemePreset(): ThemeCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useThemePreset must be used within ThemeRegistry');
  return c;
}

export default function ThemeRegistry({
  initialPreset,
  children,
}: {
  initialPreset: string;
  children: React.ReactNode;
}) {
  const [preset, setPresetState] = useState(
    PRESETS[initialPreset] ? initialPreset : DEFAULT_PRESET,
  );
  const tokens = (PRESETS[preset] ?? PRESETS[DEFAULT_PRESET]).tokens;
  const theme = useMemo(() => buildTheme(tokens), [tokens]);
  const vars = useMemo(() => cssVars(tokens), [tokens]);

  const setPreset = (p: string) => {
    if (!PRESETS[p]) return;
    setPresetState(p);
    document.cookie = `theme=${p};path=/;max-age=31536000;samesite=lax`;
  };

  const value = useMemo(
    () => ({
      preset,
      setPreset,
      presets: Object.entries(PRESETS).map(([key, p]) => ({ key, label: p.label })),
    }),
    [preset],
  );

  return (
    <Ctx.Provider value={value}>
      <AppRouterCacheProvider options={{ key: 'mui' }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles
            styles={{
              ':root': vars,
              body: { background: tokens.effects.appBg, minHeight: '100vh' },
            }}
          />
          {children}
        </ThemeProvider>
      </AppRouterCacheProvider>
    </Ctx.Provider>
  );
}
