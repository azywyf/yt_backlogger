# YT Backlogger

A small app for tracking a personal backlog of YouTube videos — paste a link, mark videos watched, add notes, remove them. A REST API built with [Elysia](https://elysiajs.com/) on [Bun](https://bun.sh/) (SQLite via `bun:sqlite`), plus a React frontend in `frontend/`.

## Tech stack

- **Runtime:** [Bun](https://bun.sh/)
- **API:** [Elysia](https://elysiajs.com/), TypeScript
- **Database:** SQLite (`bun:sqlite`), stored in `backlog.sqlite`
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, [Vite](https://vite.dev/)

## Requirements

- [Bun](https://bun.sh/) installed (this project uses Bun's built-in SQLite driver, so Node.js alone won't run the API)

## Setup

```bash
bun install
cd frontend && bun install
```

## Running

Start the API (from the project root):

```bash
bun run dev
```

It listens on port `3000` and restarts on file changes. Then start the UI in a second terminal:

```bash
cd frontend
bun run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/videos` requests to the API on port 3000, so no CORS setup is needed.

## Tests

```bash
bun test
```

Tests call the app directly and use an in-memory database, so they never touch `backlog.sqlite`.

## Database

On startup, `src/db.ts` opens (and creates, if missing) `backlog.sqlite` in the project root and ensures a `videos` table exists:

| Column    | Type    | Notes                          |
|-----------|---------|---------------------------------|
| `id`      | INTEGER | Primary key, autoincrement     |
| `title`   | TEXT    | Required                       |
| `url`     | TEXT    | Required, unique               |
| `watched` | INTEGER | `0` or `1`, defaults to `0`    |
| `notes`   | TEXT    | Defaults to `''`               |

No migrations are needed — the table and index are created automatically the first time the server runs.

## API Reference

Base URL: `http://localhost:3000`

### `GET /videos`

Returns videos in the backlog. Optional query parameter `watched=true|false` filters by watched status; any other value returns `422`.

**Response**
```json
[
  { "id": 1, "title": "Some Talk", "url": "https://youtu.be/...", "watched": 0, "notes": "" }
]
```

### `POST /videos`

Adds a video. `url` must be a YouTube link (`youtube.com`, `www.youtube.com`, `m.youtube.com` or `youtu.be`). `title` is optional — if omitted, it is fetched from YouTube's oEmbed endpoint.

**Body**
```json
{ "url": "https://www.youtube.com/watch?v=...", "title": "Optional title" }
```

**Response**
```json
{ "success": true, "message": "Video added successfully.", "title": "Some Talk" }
```

**Errors:** `400` not a YouTube URL · `409` already in the backlog · `502` title couldn't be fetched (send a `title` yourself)

### `PATCH /videos/:id`

Updates `watched` and/or `notes`. Both are optional; fields you omit are left unchanged.

**Body**
```json
{ "watched": true, "notes": "watch at 1.5x" }
```

**Response**
```json
{ "success": true, "message": "Video updated." }
```

### `POST /videos/:id/toggle`

Flips the video's watched status.

**Response**
```json
{ "success": true, "message": "Video toggled." }
```

### `DELETE /videos/:id`

Removes a video from the backlog.

**Response**
```json
{ "success": true, "message": "Video deleted." }
```

`PATCH`, `toggle` and `DELETE` return `404` with `{ "success": false, "message": "Video not found." }` if the id doesn't exist.

## Project structure

```
src/
  index.ts        # Elysia app + route definitions
  index.test.ts   # route tests (bun test)
  db.ts           # SQLite connection + schema setup
frontend/         # Vite + React + Tailwind UI
  src/api.ts      # fetch wrappers for the API
  src/App.tsx     # the UI
backlog.sqlite    # SQLite database file (created on first run)
```
