import express, { type Express } from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type Database from "better-sqlite3";
import { createTodo, deleteTodo, updateTodo, listTodos } from "./todos.js";
import { DEFAULT_PORT } from "./types.js";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "public");

export interface CreateAppOptions {
  db: Database.Database;
}

export function createApp(opts: CreateAppOptions): Express {
  const { db } = opts;
  const app = express();

  app.use(express.json());
  app.use(express.static(publicDir));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/hello", (_req, res) => {
    res.json({ message: "Hello!" });
  });

  app.get("/api/todos", (_req, res) => {
    res.json(listTodos(db));
  });

  app.post("/api/todos", (req, res) => {
    try {
      const body = req.body as { text?: string };
      if (typeof body.text !== "string") {
        res.status(400).json({ error: "text is required" });
        return;
      }
      const todo = createTodo(db, { text: body.text });
      res.status(201).json(todo);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  app.patch("/api/todos/:id", (req, res) => {
    const id = Number(req.params.id);
    const body = req.body as { text?: string; done?: boolean };
    try {
      const todo = updateTodo(db, id, {
        text: typeof body.text === "string" ? body.text : undefined,
        done: typeof body.done === "boolean" ? body.done : undefined,
      });
      if (!todo) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }
      res.json(todo);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  app.delete("/api/todos/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!deleteTodo(db, id)) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    res.status(204).end();
  });

  app.get("/", (_req, res) => {
    res.sendFile(join(publicDir, "index.html"));
  });

  return app;
}

export function startServer(opts: CreateAppOptions & { port: number; host?: string }): void {
  const host = opts.host ?? "127.0.0.1";
  const app = createApp(opts);
  app.listen(opts.port, host, () => {
    console.log(`Todo app  http://${host}:${opts.port}`);
  });
}

export { DEFAULT_PORT };
