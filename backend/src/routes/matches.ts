import { Hono } from "hono";
import type { AppEnv } from "../types";
import { ensureSchema, mapMatch, mapSet, type Match, type Set } from "../db";

const matches = new Hono<AppEnv>();

matches.get("/", async (c) => {
  const clientId = c.req.query("clientId");

  if (!clientId) {
    return c.json({ error: "clientId is required" }, 400);
  }

  await ensureSchema(c.env);

  const result = await c.env.DB.prepare(
    `SELECT id, client_id, name, created_at
     FROM matches
     WHERE client_id = ?
     ORDER BY created_at DESC`,
  )
    .bind(clientId)
    .all<Match>();

  const rows = (result.results ?? []) as unknown as Match[];

  return c.json({ matches: rows.map((row) => mapMatch(row as any)) });
});

matches.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);

  if (!body || typeof body.name !== "string" || typeof body.clientId !== "string") {
    return c.json({ error: "name and clientId are required" }, 400);
  }

  const id = crypto.randomUUID();
  const now = Date.now();

  await ensureSchema(c.env);

  await c.env.DB.prepare(
    `INSERT INTO matches (id, client_id, name, created_at)
     VALUES (?, ?, ?, ?)`,
  )
    .bind(id, body.clientId, body.name.trim(), now)
    .run();

  const match: Match = {
    id,
    clientId: body.clientId,
    name: body.name.trim(),
    createdAt: now,
  };

  return c.json({ match }, 201);
});

matches.get("/:matchId", async (c) => {
  const matchId = c.req.param("matchId");
  const clientId = c.req.query("clientId");

  if (!clientId) {
    return c.json({ error: "clientId is required" }, 400);
  }

  await ensureSchema(c.env);

  const matchResult = await c.env.DB.prepare(
    `SELECT id, client_id, name, created_at
     FROM matches
     WHERE id = ? AND client_id = ?`,
  )
    .bind(matchId, clientId)
    .first<Match>();

  if (!matchResult) {
    return c.json({ error: "Match not found" }, 404);
  }

  const setsResult = await c.env.DB.prepare(
    `SELECT id, match_id, "index", created_at
     FROM sets
     WHERE match_id = ?
     ORDER BY "index" ASC`,
  )
    .bind(matchId)
    .all<Set>();

  const setsRows = (setsResult.results ?? []) as unknown as Set[];

  return c.json({
    match: mapMatch(matchResult as any),
    sets: setsRows.map((row) => mapSet(row as any)),
  });
});

matches.post("/:matchId/sets", async (c) => {
  const matchId = c.req.param("matchId");
  const body = await c.req.json().catch(() => null);

  if (!body || typeof body.clientId !== "string") {
    return c.json({ error: "clientId is required" }, 400);
  }

  await ensureSchema(c.env);

  const match = await c.env.DB.prepare(
    `SELECT id FROM matches WHERE id = ? AND client_id = ?`,
  )
    .bind(matchId, body.clientId)
    .first<Match>();

  if (!match) {
    return c.json({ error: "Match not found" }, 404);
  }

  const nextIndexResult = await c.env.DB.prepare(
    `SELECT COALESCE(MAX("index"), 0) + 1 AS next_index
     FROM sets
     WHERE match_id = ?`,
  )
    .bind(matchId)
    .first<{ next_index: number }>();

  const index = nextIndexResult?.next_index ?? 1;
  const id = crypto.randomUUID();
  const now = Date.now();

  await c.env.DB.prepare(
    `INSERT INTO sets (id, match_id, "index", created_at)
     VALUES (?, ?, ?, ?)`,
  )
    .bind(id, matchId, index, now)
    .run();

  const set: Set = {
    id,
    matchId,
    index,
    createdAt: now,
  };

  return c.json({ set }, 201);
});

export default matches;

