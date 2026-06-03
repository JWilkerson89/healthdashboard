'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import ScienceIcon from '@mui/icons-material/Science';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import TimelineIcon from '@mui/icons-material/Timeline';
import MenuIcon from '@mui/icons-material/Menu';
import FavoriteIcon from '@mui/icons-material/Favorite';

const NAV = [
  { href: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { href: '/activities', label: 'Activities', icon: <DirectionsRunIcon /> },
  { href: '/sleep', label: 'Sleep', icon: <BedtimeIcon /> },
  { href: '/labs', label: 'Labs', icon: <ScienceIcon /> },
  { href: '/body', label: 'Body', icon: <MonitorWeightIcon /> },
  { href: '/explorer', label: 'Explorer', icon: <TimelineIcon /> },
];

const WIDTH = 220;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const nav = (
    <List>
      {NAV.map((item) => {
        const active =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
        return (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={active}
            onClick={() => setOpen(false)}
          >
            <ListItemIcon sx={{ color: active ? 'primary.main' : 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      })}
    </List>
  );

  const brand = (
    <Toolbar sx={{ gap: 1 }}>
      <FavoriteIcon color="error" />
      <Typography variant="h6" noWrap>
        Health
      </Typography>
    </Toolbar>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {!isDesktop && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
            <FavoriteIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="h6">Health</Typography>
          </Toolbar>
        </AppBar>
      )}

      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: WIDTH, boxSizing: 'border-box' },
          }}
        >
          {brand}
          {nav}
        </Drawer>
      ) : (
        <Drawer open={open} onClose={() => setOpen(false)}>
          <Box sx={{ width: WIDTH }}>
            {brand}
            {nav}
          </Box>
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: { xs: 7, md: 0 },
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
