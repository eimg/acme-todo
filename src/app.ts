import express, { type Express } from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type Database from "better-sqlite3";
import { createTodo, deleteTodo, updateTodo, listTodos, clearDone } from "./todos.js";
import { DEFAULT_PORT } from "./types.js";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  let entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    requestCounts.set(ip, entry);
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    res.status(429).json({ error: "Too many requests" });
    return;
  }
  next();
}

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "public");

export interface CreateAppOptions {
  db: Database.Database;
}

export function createApp(opts: CreateAppOptions): Express {
  const { db } = opts;
  const app = express();

  app.use(express.json({ limit: "16kb" }));
  app.use(express.static(publicDir));

  // Security headers for API routes
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; frame-ancestors 'none'"
    );
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/hello", (_req, res) => {
    res.json({ message: "Hello!" });
  });

  app.get("/api/todos", (_req, res) => {
    res.json(listTodos(db));
  });

  app.post("/api/todos", rateLimit, (req, res) => {
    try {
      const body = req.body as { text?: string };
      if (typeof body.text !== "string") {
        res.status(400).json({ error: "text is required" });
        return;
      }
      const todo = createTodo(db, { text: body.text });
      res.status(201).json(todo);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: message });
    }
  });

  app.patch("/api/todos/:id", rateLimit, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "invalid id" });
      return;
    }
    const body = req.body as { text?: string; done?: boolean };
    const hasText = typeof body.text === "string";
    const hasDone = typeof body.done === "boolean";
    if (!hasText && !hasDone) {
      res.status(400).json({ error: "no valid fields to update" });
      return;
    }
    try {
      const todo = updateTodo(db, id, {
        text: hasText ? body.text : undefined,
        done: hasDone ? body.done : undefined,
      });
      if (!todo) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }
      res.json(todo);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: message });
    }
  });

  app.delete("/api/todos/clear", rateLimit, (_req, res) => {
    const count = clearDone(db);
    res.json({ cleared: count });
  });

  app.delete("/api/todos/:id", rateLimit, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "invalid id" });
      return;
    }
    if (!deleteTodo(db, id)) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    res.status(204).end();
  });

  app.get("/", (_req, res) => {
    res.sendFile(join(publicDir, "index.html"));
  });

  // Global error handler
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

export function startServer(opts: CreateAppOptions & { port: number; host?: string }): void {
  const host = opts.host ?? "127.0.0.1";
  const app = createApp(opts);
  app.listen(opts.port, host, () => {
    console.log(`Todo app  http://${host}:${opts.port}`);
    if (host !== "127.0.0.1" && host !== "::1" && host !== "localhost") {
      console.warn("⚠ Listening on non-localhost — no auth enabled, todos are exposed");
    }
  });
}

export { DEFAULT_PORT };
