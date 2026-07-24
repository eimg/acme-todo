import type Database from "better-sqlite3";
import type { Todo, TodoInput, TodoUpdate } from "./types.js";
import { MAX_TEXT_LENGTH } from "./types.js";

interface TodoRow {
  id: number;
  text: string;
  done: number;
  created_at: number;
  updated_at: number;
}

function toTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    text: row.text,
    done: row.done === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listTodos(db: Database.Database): Todo[] {
  const rows = db
    .prepare("SELECT * FROM todos ORDER BY done ASC, id DESC")
    .all() as TodoRow[];
  return rows.map(toTodo);
}

export function getTodo(db: Database.Database, id: number): Todo | null {
  const row = db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as TodoRow | undefined;
  return row ? toTodo(row) : null;
}

export function createTodo(db: Database.Database, input: TodoInput): Todo {
  const text = input.text.trim();
  if (!text) throw new Error("text is required");
  if (text.length > MAX_TEXT_LENGTH) throw new Error(`text must be at most ${MAX_TEXT_LENGTH} characters`);
  const now = Date.now();
  const result = db
    .prepare(
      `INSERT INTO todos (text, done, created_at, updated_at)
       VALUES (@text, 0, @now, @now)`
    )
    .run({ text, now });
  return getTodo(db, Number(result.lastInsertRowid))!;
}

export function updateTodo(db: Database.Database, id: number, patch: TodoUpdate): Todo | null {
  const existing = getTodo(db, id);
  if (!existing) return null;

  const text = patch.text !== undefined ? patch.text.trim() : existing.text;
  if (!text) throw new Error("text is required");
  if (patch.text !== undefined && text.length > MAX_TEXT_LENGTH) throw new Error(`text must be at most ${MAX_TEXT_LENGTH} characters`);

  const done = patch.done ?? existing.done;
  const now = Date.now();

  db.prepare(
    `UPDATE todos SET text = @text, done = @done, updated_at = @now WHERE id = @id`
  ).run({ id, text, done: done ? 1 : 0, now });

  return getTodo(db, id);
}

export function deleteTodo(db: Database.Database, id: number): boolean {
  const result = db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  return result.changes > 0;
}

export function clearDone(db: Database.Database): number {
  const result = db.prepare("DELETE FROM todos WHERE done = 1").run();
  return result.changes;
}
