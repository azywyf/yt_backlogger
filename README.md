# YT Backlogger

A small REST API for tracking a personal backlog of YouTube videos — add links you want to watch, mark them watched, remove them. Built with [Elysia](https://elysiajs.com/) on [Bun](https://bun.sh/), backed by a local SQLite database via `bun:sqlite`.

## Tech stack

- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** [Elysia](https://elysiajs.com/)
- **Database:** SQLite (`bun:sqlite`), stored in `backlog.sqlite`
- **Language:** TypeScript

## Requirements

- [Bun](https://bun.sh/) installed (this project uses Bun's built-in SQLite driver, so Node.js alone won't run it)

## Setup

```bash
bun install
```

## Running

```bash
bun run dev
```

This starts the server with `--watch` (auto-restarts on file changes). By default it listens on port `3000`:

```
🦊 Elysia is running at localhost:3000
```

## Database

On startup, `src/db.ts` opens (and creates, if missing) `backlog.sqlite` in the project root and ensures a `videos` table exists:

| Column    | Type    | Notes                          |
|-----------|---------|---------------------------------|
| `id`      | INTEGER | Primary key, autoincrement     |
| `title`   | TEXT    | Required                       |
| `url`     | TEXT    | Required                       |
| `watched` | INTEGER | `0` or `1`, defaults to `0`    |
| `notes`   | TEXT    | Defaults to `''`               |

No migrations are needed — the table is created automatically the first time the server runs.

## API Reference

Base URL: `http://localhost:3000`

### `GET /videos`

Returns every video in the backlog.

**Response**
```json
[
  { "id": 1, "title": "Some Talk", "url": "https://youtu.be/...", "watched": 0, "notes": "" }
]
```

### `POST /videos`

Adds a new video to the backlog.

**Body**
```json
{ "title": "Some Talk", "url": "https://youtu.be/..." }
```

**Response**
```json
{ "success": true, "message": "Video added successfully." }
```

### `PATCH /videos/:id`

Updates a video's watched status.

**Body**
```json
{ "watched": true }
```

**Response**
```json
{ "success": true, "message": "Video updated." }
```

### `DELETE /videos/:id`

Removes a video from the backlog.

**Response**
```json
{ "success": true, "message": "Video deleted." }
```

## Project structure

```
src/
  index.ts   # Elysia app + route definitions
  db.ts      # SQLite connection + schema setup
backlog.sqlite  # SQLite database file (created on first run)
```
