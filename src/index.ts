import { Elysia } from "elysia";
import db from "./db";

const app = new Elysia()
.get("/videos", () => {
  "Welcome User.";
  const videos = db.query("SELECT * FROM videos").all();
  return videos;
})
.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
