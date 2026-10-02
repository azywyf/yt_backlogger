import { Database } from "bun:sqlite";
const db = new Database(process.env.NODE_ENV === "test" ? ":memory:" : "backlog.sqlite");

db.run(`
  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    watched INTEGER NOT NULL DEFAULT 0,
    notes TEXT DEFAULT ''
  )
`);

db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_videos_url ON videos(url)");

export default db;