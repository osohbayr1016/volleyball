import type { AppEnv } from "./types";

type MatchRow = {
  id: string;
  client_id: string;
  name: string;
  created_at: number;
};

type SetRow = {
  id: string;
  match_id: string;
  index: number;
  created_at: number;
};

type EventRow = {
  id: string;
  set_id: string;
  x: number;
  y: number;
  created_at: number;
};

export type Match = {
  id: string;
  clientId: string;
  name: string;
  createdAt: number;
};

export type Set = {
  id: string;
  matchId: string;
  index: number;
  createdAt: number;
};

export type Event = {
  id: string;
  setId: string;
  x: number;
  y: number;
  createdAt: number;
};

export async function ensureSchema(env: AppEnv["Bindings"]) {
  const db = env.DB;

  await db
    .batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_matches_client
        ON matches (client_id, created_at DESC)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS sets (
        id TEXT PRIMARY KEY,
        match_id TEXT NOT NULL,
        "index" INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
      )`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_sets_match
        ON sets (match_id, "index")`),
      db.prepare(`CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        set_id TEXT NOT NULL,
        x REAL NOT NULL,
        y REAL NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (set_id) REFERENCES sets(id) ON DELETE CASCADE
      )`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_events_set
        ON events (set_id)`),
    ])
    .catch(() => {
      // If schema already exists or migrations race, ignore.
    });
}

export function mapMatch(row: MatchRow): Match {
  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name,
    createdAt: row.created_at,
  };
}

export function mapSet(row: SetRow): Set {
  return {
    id: row.id,
    matchId: row.match_id,
    index: row.index,
    createdAt: row.created_at,
  };
}

export function mapEvent(row: EventRow): Event {
  return {
    id: row.id,
    setId: row.set_id,
    x: row.x,
    y: row.y,
    createdAt: row.created_at,
  };
}

