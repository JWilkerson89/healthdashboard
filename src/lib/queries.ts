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
