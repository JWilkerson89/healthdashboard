import Database from 'better-sqlite3';
import path from 'node:path';

// Single read-only connection to the Garmin pipeline DB, reused across requests.
// The pipeline owns all writes; this app only ever reads.
let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (_db) return _db;
  const file = process.env.GARMIN_DB_PATH
    ? path.resolve(process.env.GARMIN_DB_PATH)
    : path.resolve(process.cwd(), '_ref/garmin_data.db');
  _db = new Database(file, { readonly: true, fileMustExist: true });
  // Read-only connection: do NOT set journal_mode (that writes the header and
  // fails on a readonly handle). The pipeline owns the file's WAL mode; a
  // read-only reader sees committed data without touching it.
  _db.pragma('query_only = ON');
  return _db;
}

// The DB is single-user; resolve the one user_id once and cache it.
let _userId: number | null = null;
export function userId(): number {
  if (_userId != null) return _userId;
  const row = db().prepare('SELECT user_id FROM user LIMIT 1').get() as
    | { user_id: number }
    | undefined;
  if (!row) throw new Error('No user row found in garmin_data.db');
  _userId = row.user_id;
  return _userId;
}
