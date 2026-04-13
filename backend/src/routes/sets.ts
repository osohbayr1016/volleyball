import { Hono } from "hono";
import type { AppEnv } from "../types";
import { ensureSchema, mapEvent, mapSet, type Event, type Set } from "../db";

const sets = new Hono<AppEnv>();

sets.get("/:setId", async (c) => {
  const setId = c.req.param("setId");

  await ensureSchema(c.env);

  const setRow = await c.env.DB.prepare(
    `SELECT id, match_id, "index", created_at
     FROM sets
     WHERE id = ?`,
  )
    .bind(setId)
    .first<Set>();

  if (!setRow) {
    return c.json({ error: "Set not found" }, 404);
  }

  const eventsResult = await c.env.DB.prepare(
    `SELECT id, set_id, x, y, created_at
     FROM events
     WHERE set_id = ?
     ORDER BY created_at ASC`,
  )
    .bind(setId)
    .all<Event>();

  const eventsRows = (eventsResult.results ?? []) as unknown as Event[];

  return c.json({
    set: mapSet(setRow as any),
    events: eventsRows.map((row) => mapEvent(row as any)),
  });
});

sets.post("/:setId/events", async (c) => {
  const setId = c.req.param("setId");
  const body = await c.req.json().catch(() => null);

  if (
    !body ||
    typeof body.x !== "number" ||
    typeof body.y !== "number" ||
    Number.isNaN(body.x) ||
    Number.isNaN(body.y)
  ) {
    return c.json({ error: "x and y are required numbers" }, 400);
  }

  await ensureSchema(c.env);

  const setRow = await c.env.DB.prepare(
    `SELECT id FROM sets WHERE id = ?`,
  )
    .bind(setId)
    .first<Set>();

  if (!setRow) {
    return c.json({ error: "Set not found" }, 404);
  }

  const id = crypto.randomUUID();
  const now = Date.now();

  await c.env.DB.prepare(
    `INSERT INTO events (id, set_id, x, y, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(id, setId, body.x, body.y, now)
    .run();

  const event: Event = {
    id,
    setId,
    x: body.x,
    y: body.y,
    createdAt: now,
  };

  return c.json({ event }, 201);
});

sets.put("/:setId/events/:eventId", async (c) => {
  const setId = c.req.param("setId");
  const eventId = c.req.param("eventId");
  const body = await c.req.json().catch(() => null);

  if (
    !body ||
    typeof body.x !== "number" ||
    typeof body.y !== "number" ||
    Number.isNaN(body.x) ||
    Number.isNaN(body.y)
  ) {
    return c.json({ error: "x and y are required numbers" }, 400);
  }

  await ensureSchema(c.env);

  const result = await c.env.DB.prepare(
    `UPDATE events
     SET x = ?, y = ?
     WHERE id = ? AND set_id = ?`,
  )
    .bind(body.x, body.y, eventId, setId)
    .run();

  if (!result.success || result.meta.changes === 0) {
    return c.json({ error: "Event not found" }, 404);
  }

  return c.json({ ok: true });
});

sets.delete("/:setId/events/:eventId", async (c) => {
  const setId = c.req.param("setId");
  const eventId = c.req.param("eventId");

  await ensureSchema(c.env);

  const result = await c.env.DB.prepare(
    `DELETE FROM events
     WHERE id = ? AND set_id = ?`,
  )
    .bind(eventId, setId)
    .run();

  if (!result.success || result.meta.changes === 0) {
    return c.json({ error: "Event not found" }, 404);
  }

  return c.json({ ok: true });
});

export default sets;

