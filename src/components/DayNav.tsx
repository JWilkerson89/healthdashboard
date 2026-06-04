'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function NavBtn({
  href,
  children,
  label,
}: {
  href?: string;
  children: React.ReactNode;
  label: string;
}) {
  if (!href) {
    return (
      <IconButton disabled size="small" aria-label={label}>
        {children}
      </IconButton>
    );
  }
  return (
    <IconButton component={Link} href={href} size="small" aria-label={label}>
      {children}
    </IconButton>
  );
}

/**
 * Prev/next stepper for day-/record-oriented pages. `prevHref` is the older
 * neighbor, `nextHref` the newer. Arrow keys ←/→ also navigate.
 */
export default function DayNav({
  prevHref,
  nextHref,
  label,
  sublabel,
}: {
  prevHref?: string;
  nextHref?: string;
  label: string;
  sublabel?: string;
}) {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowLeft' && prevHref) router.push(prevHref);
      if (e.key === 'ArrowRight' && nextHref) router.push(nextHref);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevHref, nextHref, router]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <NavBtn href={prevHref} label="Previous">
        <ChevronLeftIcon />
      </NavBtn>
      <Box sx={{ textAlign: 'center', minWidth: 150 }}>
        <Typography variant="subtitle2" noWrap>
          {label}
        </Typography>
        {sublabel && (
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {sublabel}
          </Typography>
        )}
      </Box>
      <NavBtn href={nextHref} label="Next">
        <ChevronRightIcon />
      </NavBtn>
    </Box>
  );
}
