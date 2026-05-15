import { Hono } from "hono";
import type { AppEnv } from "../types";
import { ensureSchema, mapEvent, type Event } from "../db";

const matchSummary = new Hono<AppEnv>();

matchSummary.get("/:matchId", async (c) => {
  const matchId = c.req.param("matchId");
  const clientId = c.req.query("clientId");

  if (!clientId) {
    return c.json({ error: "clientId is required" }, 400);
  }

  await ensureSchema(c.env);

  const matchRow = await c.env.DB.prepare(
    `SELECT id FROM matches WHERE id = ? AND client_id = ?`,
  )
    .bind(matchId, clientId)
    .first<{ id: string }>();

  if (!matchRow) {
    return c.json({ error: "Match not found" }, 404);
  }

  const eventsResult = await c.env.DB.prepare(
    `SELECT e.id, e.set_id, e.x, e.y, e.type, e.created_at
     FROM events e
     JOIN sets s ON e.set_id = s.id
     WHERE s.match_id = ?
     ORDER BY e.created_at ASC`,
  )
    .bind(matchId)
    .all<Event>();

  const rows = (eventsResult.results ?? []) as unknown as Event[];

  return c.json({
    events: rows.map((row) => mapEvent(row as any)),
  });
});

export default matchSummary;

