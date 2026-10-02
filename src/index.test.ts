import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import app from "./index";
import db from "./db";

const json = (method: string, path: string, body?: unknown) =>
  app.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );

const add = (title: string, url: string) => json("POST", "/videos", { title, url });
const list = async (query = "") => (await app.handle(new Request(`http://localhost/videos${query}`))).json();

beforeEach(() => db.run("DELETE FROM videos"));

describe("POST /videos", () => {
  it("adds a video", async () => {
    const res = await add("A", "https://youtu.be/aaa");
    expect(res.status).toBe(200);
    expect(await list()).toHaveLength(1);
  });

  it("rejects non-YouTube URLs", async () => {
    expect((await add("A", "https://evil.com/youtube.com")).status).toBe(400);
    expect((await add("A", "not a url")).status).toBe(400);
  });

  it("rejects duplicates with 409", async () => {
    await add("A", "https://youtu.be/aaa");
    expect((await add("B", "https://youtu.be/aaa")).status).toBe(409);
  });

  describe("without a title", () => {
    const realFetch = globalThis.fetch;
    afterEach(() => { globalThis.fetch = realFetch; });

    it("fetches the title from oEmbed", async () => {
      globalThis.fetch = (async () => Response.json({ title: "Fetched" })) as unknown as typeof fetch;
      const res = await json("POST", "/videos", { url: "https://youtu.be/bbb" });
      expect((await res.json()).title).toBe("Fetched");
    });

    it("returns 502 when the lookup fails", async () => {
      globalThis.fetch = (async () => new Response("no", { status: 404 })) as unknown as typeof fetch;
      const res = await json("POST", "/videos", { url: "https://youtu.be/ccc" });
      expect(res.status).toBe(502);
    });
  });
});

describe("GET /videos", () => {
  it("filters by watched", async () => {
    await add("A", "https://youtu.be/aaa");
    await add("B", "https://youtu.be/bbb");
    const [first] = await list();
    await json("PATCH", `/videos/${first.id}`, { watched: true });

    expect(await list("?watched=true")).toHaveLength(1);
    expect(await list("?watched=false")).toHaveLength(1);
    expect(await list()).toHaveLength(2);
  });

  it("rejects an invalid watched value", async () => {
    const res = await app.handle(new Request("http://localhost/videos?watched=maybe"));
    expect(res.status).toBe(422);
  });
});

describe("PATCH /videos/:id", () => {
  it("updates notes without touching watched", async () => {
    await add("A", "https://youtu.be/aaa");
    const [v] = await list();
    await json("PATCH", `/videos/${v.id}`, { notes: "hi" });
    const [after] = await list();
    expect(after.notes).toBe("hi");
    expect(after.watched).toBe(0);
  });

  it("returns 404 for a missing id", async () => {
    expect((await json("PATCH", "/videos/999", { notes: "x" })).status).toBe(404);
  });
});

describe("POST /videos/:id/toggle", () => {
  it("flips watched back and forth", async () => {
    await add("A", "https://youtu.be/aaa");
    const [v] = await list();
    await json("POST", `/videos/${v.id}/toggle`);
    expect((await list())[0].watched).toBe(1);
    await json("POST", `/videos/${v.id}/toggle`);
    expect((await list())[0].watched).toBe(0);
  });

  it("returns 404 for a missing id", async () => {
    expect((await json("POST", "/videos/999/toggle")).status).toBe(404);
  });
});

describe("DELETE /videos/:id", () => {
  it("deletes a video", async () => {
    await add("A", "https://youtu.be/aaa");
    const [v] = await list();
    expect((await json("DELETE", `/videos/${v.id}`)).status).toBe(200);
    expect(await list()).toHaveLength(0);
  });

  it("returns 404 for a missing id", async () => {
    expect((await json("DELETE", "/videos/999")).status).toBe(404);
  });
});
