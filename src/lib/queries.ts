import 'server-only';
import { db, userId } from './db';

// ---------- Dashboard / daily summary ----------

export interface DailySummary {
  date: string;
  sleep_score: number | null;
  sleep_duration_min: number | null;
  rem_min: number | null;
  deep_min: number | null;
  hrv: number | null;
  resting_hr: number | null;
  spo2_avg: number | null;
  spo2_low: number | null;
  body_battery_avg: number | null;
  body_battery_max: number | null;
  stress_avg: number | null;
  total_steps: number | null;
  total_intensity_min: number | null;
  strength_count: number | null;
  zone2_count: number | null;
}

export function getDailySummaries(): DailySummary[] {
  return db()
    .prepare(`SELECT * FROM daily_health_summary ORDER BY date ASC`)
    .all() as DailySummary[];
}

export function getLatestSummary(): DailySummary | undefined {
  return db()
    .prepare(`SELECT * FROM daily_health_summary ORDER BY date DESC LIMIT 1`)
    .get() as DailySummary | undefined;
}

// ---------- Activities ----------

export interface ActivityListItem {
  activity_id: number;
  activity_name: string | null;
  activity_type_key: string;
  start_ts: string;
  timezone_offset_hours: number;
  duration: number | null;
  distance: number | null;
  average_hr: number | null;
  max_hr: number | null;
  calories: number | null;
  activity_training_load: number | null;
  has_polyline: number;
  has_splits: number | null;
}

export function listActivities(): ActivityListItem[] {
  return db()
    .prepare(
      `SELECT activity_id, activity_name, activity_type_key, start_ts,
              timezone_offset_hours, duration, distance, average_hr, max_hr,
              calories, activity_training_load, has_polyline, has_splits
         FROM activity
        WHERE user_id = ?
        ORDER BY start_ts DESC`,
    )
    .all(userId()) as ActivityListItem[];
}

export interface ActivityDetail extends Record<string, unknown> {
  activity_id: number;
  activity_name: string | null;
  activity_type_key: string;
  start_ts: string;
  end_ts: string;
  timezone_offset_hours: number;
  duration: number | null;
  moving_duration: number | null;
  distance: number | null;
  average_speed: number | null;
  max_speed: number | null;
  calories: number | null;
  average_hr: number | null;
  max_hr: number | null;
  activity_training_load: number | null;
  aerobic_training_effect: number | null;
  anaerobic_training_effect: number | null;
  training_effect_label: string | null;
  location_name: string | null;
  hr_time_in_zone_1: number | null;
  hr_time_in_zone_2: number | null;
  hr_time_in_zone_3: number | null;
  hr_time_in_zone_4: number | null;
  hr_time_in_zone_5: number | null;
  has_polyline: number;
}

export function getActivity(id: number): ActivityDetail | undefined {
  return db()
    .prepare(`SELECT * FROM activity WHERE activity_id = ?`)
    .get(id) as ActivityDetail | undefined;
}

/** GPS track as [[lon, lat], ...] or null. */
export function getActivityPath(id: number): [number, number][] | null {
  const row = db()
    .prepare(`SELECT path_json FROM activity_path WHERE activity_id = ?`)
    .get(id) as { path_json: string } | undefined;
  if (!row) return null;
  try {
    return JSON.parse(row.path_json) as [number, number][];
  } catch {
    return null;
  }
}

export interface SplitRow {
  split_idx: number;
  split_type: string | null;
  metrics: Record<string, number>;
}

export function getActivitySplits(id: number): SplitRow[] {
  const rows = db()
    .prepare(
      `SELECT split_idx, split_type, name, value
         FROM activity_split_metric
        WHERE activity_id = ?
        ORDER BY split_idx ASC`,
    )
    .all(id) as {
    split_idx: number;
    split_type: string | null;
    name: string;
    value: number;
  }[];
  const map = new Map<number, SplitRow>();
  for (const r of rows) {
    let s = map.get(r.split_idx);
    if (!s) {
      s = { split_idx: r.split_idx, split_type: r.split_type, metrics: {} };
      map.set(r.split_idx, s);
    }
    s.metrics[r.name] = r.value;
  }
  return [...map.values()];
}

export interface StrengthSet {
  set_idx: number;
  set_type: string;
  exercise_category: string | null;
  exercise_name: string | null;
  repetition_count: number | null;
  weight: number | null;
  duration: number | null;
}

export function getStrengthSets(id: number): StrengthSet[] {
  return db()
    .prepare(
      `SELECT set_idx, set_type, exercise_category, exercise_name,
              repetition_count, weight, duration
         FROM strength_set
        WHERE activity_id = ?
        ORDER BY set_idx ASC`,
    )
    .all(id) as StrengthSet[];
}

export interface TimePoint {
  t: string;
  v: number;
}

/** Per-activity metric over time, preferring the downsampled buckets. */
export function getActivitySeries(id: number, name: string): TimePoint[] {
  const ds = db()
    .prepare(
      `SELECT bucket_ts AS t, value AS v
         FROM activity_ts_metric_downsampled
        WHERE activity_id = ? AND name = ?
        ORDER BY bucket_ts ASC`,
    )
    .all(id, name) as TimePoint[];
  if (ds.length) return ds;
  return db()
    .prepare(
      `SELECT timestamp AS t, value AS v
         FROM activity_ts_metric
        WHERE activity_id = ? AND name = ?
        ORDER BY timestamp ASC`,
    )
    .all(id, name) as TimePoint[];
}

// ---------- Sleep ----------

export interface SleepListItem {
  sleep_id: number;
  calendar_date: string | null;
  start_ts: string;
  end_ts: string;
  timezone_offset_hours: number;
  sleep_time_seconds: number | null;
  deep_sleep_seconds: number | null;
  light_sleep_seconds: number | null;
  rem_sleep_seconds: number | null;
  awake_sleep_seconds: number | null;
  score_overall_value: number | null;
  avg_overnight_hrv: number | null;
  resting_heart_rate: number | null;
  average_spo2: number | null;
  avg_sleep_stress: number | null;
  body_battery_change: number | null;
}

export function listSleep(): SleepListItem[] {
  return db()
    .prepare(
      `SELECT sleep_id, calendar_date, start_ts, end_ts, timezone_offset_hours,
              sleep_time_seconds, deep_sleep_seconds, light_sleep_seconds,
              rem_sleep_seconds, awake_sleep_seconds, score_overall_value,
              avg_overnight_hrv, resting_heart_rate, average_spo2,
              avg_sleep_stress, body_battery_change
         FROM sleep
        WHERE user_id = ?
        ORDER BY start_ts DESC`,
    )
    .all(userId()) as SleepListItem[];
}

export function getSleep(id: number): (SleepListItem & Record<string, unknown>) | undefined {
  return db().prepare(`SELECT * FROM sleep WHERE sleep_id = ?`).get(id) as
    | (SleepListItem & Record<string, unknown>)
    | undefined;
}

export interface SleepStage {
  start_ts: string;
  end_ts: string;
  stage: number;
  stage_label: string;
}

export function getSleepLevels(id: number): SleepStage[] {
  return db()
    .prepare(
      `SELECT start_ts, end_ts, stage, stage_label
         FROM sleep_level WHERE sleep_id = ? ORDER BY start_ts ASC`,
    )
    .all(id) as SleepStage[];
}

export function getSleepSeries(
  id: number,
  table: 'hrv' | 'spo2',
): TimePoint[] {
  // table is a fixed literal from the union — safe to interpolate.
  return db()
    .prepare(
      `SELECT timestamp AS t, value AS v FROM ${table}
        WHERE sleep_id = ? ORDER BY timestamp ASC`,
    )
    .all(id) as TimePoint[];
}

// ---------- Labs (blood panels) ----------

export interface BloodPanelRow {
  id: number;
  date: string;
  test_name: string;
  value: number | null;
  unit: string | null;
  ref_low: number | null;
  ref_high: number | null;
  flags: string | null;
  notes: string | null;
}

export function listBloodPanels(): BloodPanelRow[] {
  return db()
    .prepare(`SELECT * FROM blood_panels ORDER BY date DESC, test_name ASC`)
    .all() as BloodPanelRow[];
}

// ---------- Body composition ----------

export interface BodyCompRow {
  id: number;
  date: string;
  weight: number | null;
  bf_pct: number | null;
  smm: number | null;
  fat_mass: number | null;
  lean_mass: number | null;
  ecw_tbw: number | null;
  notes: string | null;
}

export function listBodyComp(): BodyCompRow[] {
  return db()
    .prepare(`SELECT * FROM body_comp ORDER BY date ASC`)
    .all() as BodyCompRow[];
}

// ---------- Nutrition (meals) ----------

export interface Meal {
  id: number;
  date: string;
  meal_type: string | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  calories: number | null;
  notes: string | null;
  source: string | null;
}

export interface DailyNutrition {
  date: string;
  meals: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export function listMeals(): Meal[] {
  return db()
    .prepare(
      `SELECT id, date, meal_type, protein, fat, carbs, calories, notes, source
         FROM meals ORDER BY date DESC, id ASC`,
    )
    .all() as Meal[];
}

/** Per-day rollup of intake, most recent first. */
export function dailyNutrition(): DailyNutrition[] {
  return db()
    .prepare(
      `SELECT date,
              COUNT(*)               AS meals,
              COALESCE(SUM(calories), 0) AS calories,
              COALESCE(SUM(protein), 0)  AS protein,
              COALESCE(SUM(fat), 0)      AS fat,
              COALESCE(SUM(carbs), 0)    AS carbs
         FROM meals
        GROUP BY date
        ORDER BY date DESC`,
    )
    .all() as DailyNutrition[];
}

// ---------- Raw time-series explorer ----------

export interface MetricDef {
  key: string;
  label: string;
  unit: string;
  scope: 'user' | 'sleep';
  table: string;
  valueExpr: string;
}

export const METRICS: MetricDef[] = [
  { key: 'heart_rate', label: 'Heart Rate', unit: 'bpm', scope: 'user', table: 'heart_rate', valueExpr: 'value' },
  { key: 'stress', label: 'Stress', unit: '0–100', scope: 'user', table: 'stress', valueExpr: 'value' },
  { key: 'body_battery', label: 'Body Battery', unit: '0–100', scope: 'user', table: 'body_battery', valueExpr: 'value' },
  { key: 'respiration', label: 'Respiration', unit: 'brpm', scope: 'user', table: 'respiration', valueExpr: 'value' },
  { key: 'steps', label: 'Steps (15-min)', unit: 'steps', scope: 'user', table: 'steps', valueExpr: 'value' },
  { key: 'intensity_minutes', label: 'Intensity Minutes', unit: 'min', scope: 'user', table: 'intensity_minutes', valueExpr: 'value' },
  { key: 'spo2', label: 'SpO₂ (sleep)', unit: '%', scope: 'sleep', table: 'spo2', valueExpr: 'value' },
  { key: 'hrv', label: 'HRV (sleep)', unit: 'ms', scope: 'sleep', table: 'hrv', valueExpr: 'value' },
];

export function metricDef(key: string): MetricDef | undefined {
  return METRICS.find((m) => m.key === key);
}

/** Distinct local-ish dates available for a metric (for the day picker). */
export function metricDates(key: string): string[] {
  const m = metricDef(key);
  if (!m) return [];
  if (m.scope === 'user') {
    const rows = db()
      .prepare(
        `SELECT DISTINCT date(timestamp) AS d FROM ${m.table}
          WHERE user_id = ? ORDER BY d DESC`,
      )
      .all(userId()) as { d: string }[];
    return rows.map((r) => r.d);
  }
  const rows = db()
    .prepare(
      `SELECT DISTINCT date(s.timestamp) AS d
         FROM ${m.table} s JOIN sleep sl ON sl.sleep_id = s.sleep_id
        WHERE sl.user_id = ? ORDER BY d DESC`,
    )
    .all(userId()) as { d: string }[];
  return rows.map((r) => r.d);
}

/** Raw samples for one metric across [date 00:00, date+1 00:00) UTC. */
export function metricSeries(key: string, date: string): TimePoint[] {
  const m = metricDef(key);
  if (!m) return [];
  const from = `${date} 00:00:00`;
  const to = `${date} 23:59:59`;
  if (m.scope === 'user') {
    return db()
      .prepare(
        `SELECT timestamp AS t, ${m.valueExpr} AS v FROM ${m.table}
          WHERE user_id = ? AND timestamp BETWEEN ? AND ?
          ORDER BY timestamp ASC`,
      )
      .all(userId(), from, to) as TimePoint[];
  }
  return db()
    .prepare(
      `SELECT s.timestamp AS t, s.${m.valueExpr} AS v
         FROM ${m.table} s JOIN sleep sl ON sl.sleep_id = s.sleep_id
        WHERE sl.user_id = ? AND s.timestamp BETWEEN ? AND ?
        ORDER BY s.timestamp ASC`,
    )
    .all(userId(), from, to) as TimePoint[];
}

// ---------- Training / performance ----------

export interface TrainingReadiness {
  timestamp: string;
  timezone_offset_hours: number;
  score: number | null;
  level: string | null;
  recovery_time: number | null;
  feedback_long: string | null;
  sleep_score_factor_percent: number | null;
  sleep_score_factor_feedback: string | null;
  recovery_time_factor_percent: number | null;
  recovery_time_factor_feedback: string | null;
  acwr_factor_percent: number | null;
  acwr_factor_feedback: string | null;
  hrv_factor_percent: number | null;
  hrv_factor_feedback: string | null;
  stress_history_factor_percent: number | null;
  stress_history_factor_feedback: string | null;
  sleep_history_factor_percent: number | null;
  sleep_history_factor_feedback: string | null;
}

export function latestReadiness(): TrainingReadiness | undefined {
  return db()
    .prepare(
      `SELECT * FROM training_readiness WHERE user_id = ?
        ORDER BY timestamp DESC LIMIT 1`,
    )
    .get(userId()) as TrainingReadiness | undefined;
}

/** Last readiness score per day, ascending (for trend charts). */
export function readinessTrend(): { date: string; value: number | null }[] {
  return db()
    .prepare(
      `SELECT date(timestamp) AS date, score AS value, MAX(timestamp)
         FROM training_readiness WHERE user_id = ?
        GROUP BY date(timestamp) ORDER BY date ASC`,
    )
    .all(userId()) as { date: string; value: number | null }[];
}

export interface TrainingLoad {
  date: string;
  acwr_percent: number | null;
  acwr_status: string | null;
  training_status_feedback_phrase: string | null;
  training_balance_feedback_phrase: string | null;
  daily_training_load_acute: number | null;
  daily_training_load_chronic: number | null;
}

export function latestTrainingLoad(): TrainingLoad | undefined {
  return db()
    .prepare(
      `SELECT date, acwr_percent, acwr_status, training_status_feedback_phrase,
              training_balance_feedback_phrase, daily_training_load_acute,
              daily_training_load_chronic
         FROM training_load WHERE user_id = ?
        ORDER BY date DESC LIMIT 1`,
    )
    .get(userId()) as TrainingLoad | undefined;
}

export function trainingLoadTrend(): {
  date: string;
  acute: number | null;
  chronic: number | null;
}[] {
  return db()
    .prepare(
      `SELECT date, daily_training_load_acute AS acute,
              daily_training_load_chronic AS chronic
         FROM training_load WHERE user_id = ? ORDER BY date ASC`,
    )
    .all(userId()) as { date: string; acute: number | null; chronic: number | null }[];
}

export function vo2MaxTrend(): { date: string; value: number | null }[] {
  return db()
    .prepare(
      `SELECT date, vo2_max_generic AS value FROM vo2_max
        WHERE user_id = ? ORDER BY date ASC`,
    )
    .all(userId()) as { date: string; value: number | null }[];
}

export interface RacePredictions {
  date: string;
  time_5k: number | null;
  time_10k: number | null;
  time_half_marathon: number | null;
  time_marathon: number | null;
}

export function latestRacePredictions(): RacePredictions | undefined {
  return db()
    .prepare(
      `SELECT date, time_5k, time_10k, time_half_marathon, time_marathon
         FROM race_predictions WHERE user_id = ?
        ORDER BY date DESC LIMIT 1`,
    )
    .get(userId()) as RacePredictions | undefined;
}

export interface PersonalRecord {
  type_id: number;
  label: string | null;
  value: number | null;
  timestamp: string;
  activity_id: number | null;
}

export function personalRecords(): PersonalRecord[] {
  return db()
    .prepare(
      `SELECT type_id, label, value, timestamp, activity_id
         FROM personal_record
        WHERE user_id = ? AND latest = 1 AND label IS NOT NULL AND label <> ''
        ORDER BY type_id ASC`,
    )
    .all(userId()) as PersonalRecord[];
}

// ---------- Sleep enrichment ----------

export function getSleepMovement(id: number): TimePoint[] {
  return db()
    .prepare(
      `SELECT timestamp AS t, activity_level AS v FROM sleep_movement
        WHERE sleep_id = ? ORDER BY timestamp ASC`,
    )
    .all(id) as TimePoint[];
}

export function getSleepEventCounts(id: number): {
  restless: number;
  breathing: number;
} {
  const restless = (
    db()
      .prepare(`SELECT COUNT(*) AS c FROM sleep_restless_moment WHERE sleep_id = ?`)
      .get(id) as { c: number }
  ).c;
  const breathing = (
    db()
      .prepare(`SELECT COUNT(*) AS c FROM breathing_disruption WHERE sleep_id = ?`)
      .get(id) as { c: number }
  ).c;
  return { restless, breathing };
}

// ---------- Activity laps ----------

export interface LapRow {
  lap_idx: number;
  metrics: Record<string, number>;
}

export function getActivityLaps(id: number): LapRow[] {
  const rows = db()
    .prepare(
      `SELECT lap_idx, name, value FROM activity_lap_metric
        WHERE activity_id = ? ORDER BY lap_idx ASC`,
    )
    .all(id) as { lap_idx: number; name: string; value: number }[];
  const map = new Map<number, LapRow>();
  for (const r of rows) {
    let lap = map.get(r.lap_idx);
    if (!lap) {
      lap = { lap_idx: r.lap_idx, metrics: {} };
      map.set(r.lap_idx, lap);
    }
    lap.metrics[r.name] = r.value;
  }
  return [...map.values()];
}

// ---------- Health journal + supplements ----------

export interface HealthNote {
  id: number;
  entry_date: string;
  category: string;
  source: string | null;
  content: string;
  action_items: string | null; // JSON array of strings
  linked_records: string | null; // JSON
  priority: string | null;
}

export function listHealthNotes(): HealthNote[] {
  return db()
    .prepare(
      `SELECT id, entry_date, category, source, content, action_items,
              linked_records, priority
         FROM health_notes
        ORDER BY entry_date DESC, id DESC`,
    )
    .all() as HealthNote[];
}

export interface Supplement {
  id: number;
  entry_date: string;
  supplement: string;
  dosage: string | null;
  timing: string | null;
  notes: string | null;
  efficacy: string | null;
  reason: string | null;
  linked_note_id: number | null;
}

/** Current supplement stack, ordered by daily timing then name. */
export function listSupplements(): Supplement[] {
  return db()
    .prepare(
      `SELECT id, entry_date, supplement, dosage, timing, notes, efficacy,
              reason, linked_note_id
         FROM supplement_log
        ORDER BY CASE lower(timing)
                   WHEN 'morning' THEN 0
                   WHEN 'throughout' THEN 1
                   WHEN 'evening' THEN 2
                   ELSE 3 END,
                 supplement ASC`,
    )
    .all() as Supplement[];
}

// ---------- Daily consult (source of record) ----------

export interface Consult {
  id: number;
  date: string;
  created_at: string;
  summary: string | null;
  critical_findings: string | null;
  tone: string | null;
  full_body: string | null;
}

export interface Snapshot {
  date: string;
  sleep_score: number | null;
  sleep_duration_min: number | null;
  hrv: number | null;
  resting_hr: number | null;
  spo2_low: number | null;
  body_battery_avg: number | null;
  stress_avg: number | null;
  total_steps: number | null;
  training_rec: string | null;
  supplement_note: string | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  calories: number | null;
  status: string | null;
}

export interface Trend {
  id: number;
  metric: string;
  date: string;
  value: number | null;
  unit: string | null;
  status: string;
  note: string | null;
}

export interface Recommendation {
  id: number;
  date: string;
  priority: string;
  category: string;
  recommendation: string;
  completed: number;
  resolved_at: string | null;
}

export function consultDates(): string[] {
  return (
    db().prepare(`SELECT date FROM health_consults ORDER BY date DESC`).all() as {
      date: string;
    }[]
  ).map((r) => r.date);
}

/** A consult by date, or the most recent one. */
export function getConsult(date?: string): Consult | undefined {
  if (date) {
    return db().prepare(`SELECT * FROM health_consults WHERE date = ?`).get(date) as
      | Consult
      | undefined;
  }
  return db()
    .prepare(`SELECT * FROM health_consults ORDER BY date DESC LIMIT 1`)
    .get() as Consult | undefined;
}

export function getSnapshot(date: string): Snapshot | undefined {
  return db()
    .prepare(`SELECT * FROM daily_health_snapshots WHERE date = ?`)
    .get(date) as Snapshot | undefined;
}

export function getTrends(date: string): Trend[] {
  return db()
    .prepare(
      `SELECT * FROM health_trends WHERE date = ?
        ORDER BY CASE status
                   WHEN 'critical' THEN 0 WHEN 'worsening' THEN 1
                   WHEN 'warning' THEN 2 WHEN 'elevated' THEN 3 WHEN 'low' THEN 4
                   ELSE 5 END, metric`,
    )
    .all(date) as Trend[];
}

const PRIORITY_ORDER = `CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END`;

/** Open (incomplete) recommendations across all consults, by priority. */
export function openRecommendations(): Recommendation[] {
  return db()
    .prepare(
      `SELECT * FROM health_recommendations WHERE completed = 0
        ORDER BY ${PRIORITY_ORDER}, date ASC`,
    )
    .all() as Recommendation[];
}

/** One metric's values over time (for trend charts as history accumulates). */
export function metricHistory(metric: string): { date: string; value: number | null }[] {
  return db()
    .prepare(`SELECT date, value FROM health_trends WHERE metric = ? ORDER BY date ASC`)
    .all(metric) as { date: string; value: number | null }[];
}

// ---------- Health events (timeline) ----------

export interface HealthEvent {
  id: number;
  date: string;
  category: string;
  title: string;
  details: string | null;
  severity: string | null;
  resolved: number;
  resolved_at: string | null;
}

export function listHealthEvents(): HealthEvent[] {
  return db()
    .prepare(
      `SELECT id, date, category, title, details, severity, resolved, resolved_at
         FROM health_events ORDER BY date DESC, id DESC`,
    )
    .all() as HealthEvent[];
}

export function eventsForDate(date: string): HealthEvent[] {
  return db()
    .prepare(
      `SELECT id, date, category, title, details, severity, resolved, resolved_at
         FROM health_events WHERE date = ? ORDER BY id DESC`,
    )
    .all(date) as HealthEvent[];
}

// ---------- Reverse-linked notes (note ⇄ asset) ----------
//
// health_notes.linked_records is a JSON array of string references in the form
// "<table>.<column>='<value>'" (mostly date-keyed), e.g.
//   ["activity_summary.date='2026-06-02'", "blood_panels.date='2026-06-19'"].
// We parse in JS (not SQL json_each) so a single malformed row can never break
// the page, and index backwards: given an asset, find the notes about it.
// The legacy {type, id} object form is also accepted.

export interface NoteSummary {
  count: number;
  category: string; // representative category (high-priority wins)
  highPriority: boolean;
}

export type AssetKind = 'activity' | 'sleep' | 'blood_panel' | 'meal' | 'day';

// Which ref tables resolve to each asset kind (a note may reference either).
const ASSET_KEYS: Record<AssetKind, string[]> = {
  activity: ['activity_summary', 'activity'],
  sleep: ['daily_health_summary', 'sleep'],
  blood_panel: ['blood_panels', 'blood_panel'],
  meal: ['meals'],
  day: ['daily_health_summary'],
};

interface ParsedRef {
  table: string;
  value: string;
}

function parseRefs(linked: string | null): ParsedRef[] {
  if (!linked) return [];
  let arr: unknown;
  try {
    arr = JSON.parse(linked);
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  const refs: ParsedRef[] = [];
  for (const item of arr) {
    if (typeof item === 'string') {
      // "table.column='value'" → {table, value}
      const m = item.match(/^\s*([A-Za-z_]\w*)\s*\.\s*\w+\s*=\s*'?([^']*?)'?\s*$/);
      if (m) refs.push({ table: m[1], value: m[2] });
    } else if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>;
      if (o.type != null && o.id != null) refs.push({ table: String(o.type), value: String(o.id) });
    }
  }
  return refs;
}

/**
 * In-memory reverse index over all notes' linked_records. Cheap to build (notes
 * are few); construct once per request and reuse for list pages.
 */
export class NoteIndex {
  private byKey = new Map<string, HealthNote[]>();

  constructor(notes: HealthNote[]) {
    for (const n of notes) {
      for (const r of parseRefs(n.linked_records)) {
        const key = `${r.table}:${r.value}`;
        const list = this.byKey.get(key) ?? [];
        if (!list.some((x) => x.id === n.id)) list.push(n);
        this.byKey.set(key, list);
      }
    }
  }

  /** Notes linking an asset of `kind` identified by `value` (usually a date). */
  notesFor(kind: AssetKind, value: string | null | undefined): HealthNote[] {
    if (!value) return [];
    const seen = new Set<number>();
    const out: HealthNote[] = [];
    for (const table of ASSET_KEYS[kind]) {
      for (const n of this.byKey.get(`${table}:${value}`) ?? []) {
        if (!seen.has(n.id)) {
          seen.add(n.id);
          out.push(n);
        }
      }
    }
    out.sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1));
    return out;
  }

  summaryFor(kind: AssetKind, value: string | null | undefined): NoteSummary | undefined {
    const notes = this.notesFor(kind, value);
    if (!notes.length) return undefined;
    const lead = notes.find((n) => n.priority === 'high') ?? notes[0];
    return {
      count: notes.length,
      category: lead.category,
      highPriority: notes.some((n) => n.priority === 'high'),
    };
  }
}

export function noteIndex(): NoteIndex {
  return new NoteIndex(listHealthNotes());
}

// ---------- Profile / header stats ----------

export interface Profile {
  full_name: string | null;
  gender: string | null;
  vo2_max_running: number | null;
  vo2_max_cycling: number | null;
}

/** Representative local UTC offset (hours) from the most recent activity. */
export function getLocalOffset(): number {
  const row = db()
    .prepare(
      `SELECT timezone_offset_hours AS o FROM activity
        WHERE user_id = ? ORDER BY start_ts DESC LIMIT 1`,
    )
    .get(userId()) as { o: number } | undefined;
  return row?.o ?? 0;
}

export function getProfile(): Profile | undefined {
  return db()
    .prepare(
      `SELECT u.full_name, p.gender, p.vo2_max_running, p.vo2_max_cycling
         FROM user u
         LEFT JOIN user_profile p ON p.user_id = u.user_id AND p.latest = 1
        WHERE u.user_id = ?`,
    )
    .get(userId()) as Profile | undefined;
}
