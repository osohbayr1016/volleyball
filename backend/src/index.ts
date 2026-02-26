import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppEnv } from "./types";
import health from "./routes/health";

const app = new Hono<AppEnv>();

app.use("/*", cors());

app.route("/health", health);

app.get("/", (c) => {
  return c.json({ message: "Volleyball API" });
});

export default app;
