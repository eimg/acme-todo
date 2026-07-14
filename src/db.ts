import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

export function resolveDataDir(): string {
  return process.env.TODO_APP_DATA_DIR ?? join(projectRoot, "data");
}

export function openDatabase(dataDir = resolveDataDir()): Database.Database {
  mkdirSync(dataDir, { recursive: true });
  const db = new Database(join(dataDir, "todos.db"));
  db.pragma("journal_mode = WAL");
  migrate(db);
  return db;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_todos_done ON todos(done);
  `);

  // Add priority column if it doesn't already exist
  const cols = db.prepare("PRAGMA table_info(todos)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "priority")) {
    db.exec("ALTER TABLE todos ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium'");
  }
}
