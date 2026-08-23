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
.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
