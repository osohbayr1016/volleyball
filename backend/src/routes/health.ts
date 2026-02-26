import { Hono } from "hono";
import type { AppEnv } from "../types";

const health = new Hono<AppEnv>();

health.get("/", (c) => {
  return c.json({ status: "ok", timestamp: Date.now() });
});

export default health;
