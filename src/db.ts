import { Database } from "bun:sqlite";
const db = new Database("backlog.sqlite");

db.run(`
  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    watched INTEGER NOT NULL DEFAULT 0,
    notes TEXT DEFAULT ''
  )
`);

export default db;