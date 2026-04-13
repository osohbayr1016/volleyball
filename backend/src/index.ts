import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppEnv } from "./types";
import health from "./routes/health";
import matches from "./routes/matches";
import sets from "./routes/sets";
import matchSummary from "./routes/matchSummary";

const app = new Hono<AppEnv>();

app.use(
  "/api/*",
  cors({
    origin: "*",
  }),
);

app.route("/health", health);
app.route("/api/matches", matches);
app.route("/api/sets", sets);
app.route("/api/match-summary", matchSummary);

export default app;
