import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { SCHEMA_SQL } from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __boardGameDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "app.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA_SQL);
  return db;
}

// Reuse a single connection across hot-reloads / module re-imports in dev.
export const db = globalThis.__boardGameDb ?? createConnection();
if (process.env.NODE_ENV !== "production") {
  globalThis.__boardGameDb = db;
}
