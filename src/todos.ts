import type Database from "better-sqlite3";
import type { Todo, TodoInput, TodoUpdate, Priority } from "./types.js";
import { VALID_PRIORITIES } from "./types.js";

interface TodoRow {
  id: number;
  text: string;
  priority: string;
  done: number;
  created_at: number;
  updated_at: number;
}

function toTodo(row: TodoRow): Todo {
  const priority = VALID_PRIORITIES.includes(row.priority as Priority)
    ? (row.priority as Priority)
    : "medium";
  return {
    id: row.id,
    text: row.text,
    priority,
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
  const priority: Priority = input.priority ?? "medium";
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new Error(`Invalid priority: ${priority}`);
  }
  const now = Date.now();
  const result = db
    .prepare(
      `INSERT INTO todos (text, priority, done, created_at, updated_at)
       VALUES (@text, @priority, 0, @now, @now)`
    )
    .run({ text, priority, now });
  return getTodo(db, Number(result.lastInsertRowid))!;
}

export function updateTodo(db: Database.Database, id: number, patch: TodoUpdate): Todo | null {
  const existing = getTodo(db, id);
  if (!existing) return null;

  const text = patch.text !== undefined ? patch.text.trim() : existing.text;
  if (!text) throw new Error("text is required");

  const done = patch.done ?? existing.done;
  const priority: Priority = patch.priority ?? existing.priority;
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new Error(`Invalid priority: ${priority}`);
  }
  const now = Date.now();

  db.prepare(
    `UPDATE todos SET text = @text, priority = @priority, done = @done, updated_at = @now WHERE id = @id`
  ).run({ id, text, priority, done: done ? 1 : 0, now });

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
