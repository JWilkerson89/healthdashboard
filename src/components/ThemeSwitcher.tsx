'use client';
import { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckIcon from '@mui/icons-material/Check';
import { useThemePreset } from '@/app/ThemeRegistry';

export default function ThemeSwitcher() {
  const { preset, setPreset, presets } = useThemePreset();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  return (
    <>
      <Tooltip title="Theme">
        <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small">
          <PaletteIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {presets.map((p) => (
          <MenuItem
            key={p.key}
            selected={p.key === preset}
            onClick={() => {
              setPreset(p.key);
              setAnchor(null);
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              {p.key === preset && <CheckIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>{p.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
