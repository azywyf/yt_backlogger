import { Elysia } from "elysia";

const app = new Elysia().get("/videos", () => {
  "Welcome User.";
  return [
    {
      id: 1,
      title: "Example Video",
      url: "https://youtube.com/watch?v=example",
      watched: false,
      notes: ""
    }
  ];
})
.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
