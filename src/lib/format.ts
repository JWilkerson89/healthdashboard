// Display helpers. Garmin stores weight/volume in grams, distance in meters,
// durations in seconds, and timestamps in UTC (with a separate offset column
// on activity/sleep). 24-hour time everywhere — no AM/PM.

export function gramsToLb(g: number | null | undefined): number | null {
  return g == null ? null : g / 453.59237;
}

export function gramsToKg(g: number | null | undefined): number | null {
  return g == null ? null : g / 1000;
}

export function metersToMiles(m: number | null | undefined): number | null {
  return m == null ? null : m / 1609.344;
}

export function metersToKm(m: number | null | undefined): number | null {
  return m == null ? null : m / 1000;
}

/** Seconds → "H:MM:SS" or "M:SS". */
export function fmtDuration(seconds: number | null | undefined): string {
  if (seconds == null) return '—';
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/** Minutes → "Hh MMm". */
export function fmtMinutes(min: number | null | undefined): string {
  if (min == null) return '—';
  const total = Math.round(min);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

export function fmtNum(
  n: number | null | undefined,
  digits = 0,
): string {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/**
 * A UTC SQLite timestamp ("YYYY-MM-DD HH:MM:SS") plus a timezone offset in
 * hours → a Date whose UTC fields read as the *local* wall-clock time. We use
 * this purely for formatting; we never re-localize by the viewer's tz.
 */
export function toLocal(utc: string, offsetHours: number): Date {
  const ms = Date.parse(utc.replace(' ', 'T') + 'Z');
  return new Date(ms + offsetHours * 3600_000);
}

/** Format a local-wall-clock Date as 24h "HH:mm". */
export function fmtTime(d: Date): string {
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(
    d.getUTCMinutes(),
  ).padStart(2, '0')}`;
}

export function fmtDateLong(date: string): string {
  // date is "YYYY-MM-DD"; render without tz drift.
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function fmtDateShort(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Personal-record value formatting depends on what the record measures, which
 * we infer from its label: distances (Longest) → km, power → W, ascent → m,
 * step counts → number, otherwise a time PR in seconds → H:MM:SS.
 */
export function fmtPR(label: string | null, value: number | null): string {
  if (value == null) return '—';
  const l = (label ?? '').toLowerCase();
  if (l.includes('power')) return `${Math.round(value)} W`;
  if (l.includes('ascent')) return `${Math.round(value)} m`;
  if (l.includes('streak')) return `${Math.round(value)} days`;
  if (l.includes('steps')) return Math.round(value).toLocaleString();
  if (l.includes('longest')) {
    const km = value / 1000;
    return km >= 1 ? `${km.toFixed(2)} km` : `${Math.round(value)} m`;
  }
  return fmtDuration(value);
}

/** Title-case a Garmin enum key like "lap_swimming" → "Lap Swimming". */
export function humanize(key: string | null | undefined): string {
  if (!key) return '—';
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
