import { Elysia, t } from "elysia";
import db from "./db";

const YT_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);

function isYouTubeUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (u.protocol === "https:" || u.protocol === "http:") && YT_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

async function fetchTitle(url: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return data.title ?? null;
  } catch {
    return null;
  }
}

const app = new Elysia()
.get(
  "/videos",
  ({ query }) => {
    "Welcome User.";
    if (query.watched === undefined) {
      return db.query("SELECT * FROM videos").all();
    }
    return db
      .query("SELECT * FROM videos WHERE watched = ?")
      .all(query.watched === "true" ? 1 : 0);
  },
  {
    query: t.Object({
      watched: t.Optional(t.Union([t.Literal("true"), t.Literal("false")]))
    })
  }
)
.post(
  "/videos",
  async ({ body, set }) => {
    const { url } = body;
    if (!isYouTubeUrl(url)) {
      set.status = 400;
      return {success: false, message: "URL must be a YouTube link."};
    }
    const title = body.title ?? (await fetchTitle(url));
    if (!title) {
      set.status = 502;
      return {success: false, message: "Couldn't fetch the title. Please provide one."};
    }
    try {
      db.query("INSERT INTO videos (title, url) VALUES (?, ?)").run(title, url);
    } catch (e) {
      if (e instanceof Error && e.message.includes("UNIQUE")) {
        set.status = 409;
        return {success: false, message: "Video already in backlog."};
      }
      throw e;
    }
    return {success: true, message: "Video added successfully.", title};
  },
  {
    body: t.Object({
      title: t.Optional(t.String()),
      url: t.String()
    })
  }
)
.patch(
  "/videos/:id",
  ({ params, body, set }) => {
    const { id } = params;
    const { watched, notes } = body;
    const result = db.query(
      `UPDATE videos
       SET watched = COALESCE(?, watched),
           notes   = COALESCE(?, notes)
       WHERE id = ?`
    ).run(
      watched === undefined ? null : watched ? 1 : 0,
      notes ?? null,
      id
    );
    if (result.changes === 0) {
      set.status = 404;
      return {success: false, message: "Video not found."};
    }
    return {success: true, message: "Video updated."};
  },
  {
    body: t.Object({
      watched: t.Optional(t.Boolean()),
      notes: t.Optional(t.String())
    })
  }
)
.post("/videos/:id/toggle", ({ params, set }) => {
  const result = db.query(
    "UPDATE videos SET watched = 1 - watched WHERE id = ?"
  ).run(params.id);
  if (result.changes === 0) {
    set.status = 404;
    return {success: false, message: "Video not found."};
  }
  return {success: true, message: "Video toggled."};
})
.delete("/videos/:id", ({ params, set }) => {
  const { id } = params;
  const result = db.query("DELETE FROM videos WHERE id = ?").run(id);
  if (result.changes === 0) {
    set.status = 404;
    return {success: false, message: "Video not found."};
  }
  return {success: true, message: "Video deleted."};
});

export default app;

if (import.meta.main) {
  app.listen(3000);
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}
