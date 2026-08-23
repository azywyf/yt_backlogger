import { Elysia, t } from "elysia";
import db from "./db";

const app = new Elysia()
.get("/videos", () => {
  "Welcome User.";
  const videos = db.query("SELECT * FROM videos").all();
  return videos;
})
.post(
  "/videos",
  ({ body }) => {
    const { title, url } = body;
    db.query(
      "INSERT INTO videos (title, url) VALUES (?, ?)",
    ).run(title, url);
    return {success: true, message: "Video added successfully."};
  },
  {
    body: t.Object({
      title: t.String(),
      url: t.String()
    })
  }
)
.patch(
  "/videos/:id",
  ({ params, body }) => {
    const { id } = params;
    const { watched } = body;
    db.query(
      "UPDATE videos SET watched = ? WHERE id = ?"
    ).run(
      watched ? 1 : 0,
      id
    );
    return {success: true, message: "Video updated."};
  },
  {
    body: t.Object({
      watched: t.Boolean()
    })
  }
)

.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
