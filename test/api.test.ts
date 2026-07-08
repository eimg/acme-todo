import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { openDatabase } from "../src/db.js";
import { createApp } from "../src/app.js";

describe("todo-app API", () => {
  let dataDir: string;
  let db: ReturnType<typeof openDatabase>;
  let app: ReturnType<typeof createApp>;

  before(() => {
    dataDir = mkdtempSync(join(tmpdir(), "todo-app-"));
    db = openDatabase(dataDir);
    app = createApp({ db });
  });

  after(() => {
    db.close();
    rmSync(dataDir, { recursive: true, force: true });
  });

  it("says hello", async () => {
    const res = await request(app).get("/api/hello").expect(200);
    assert.equal(res.body.message, "Hello!");
  });

  it("creates and lists todos", async () => {
    const created = await request(app).post("/api/todos").send({ text: "Buy milk" }).expect(201);
    assert.equal(created.body.text, "Buy milk");
    assert.equal(created.body.done, false);

    const list = await request(app).get("/api/todos").expect(200);
    assert.equal(list.body.length, 1);
    assert.equal(list.body[0].text, "Buy milk");
  });

  it("toggles and deletes a todo", async () => {
    const created = await request(app).post("/api/todos").send({ text: "Walk" }).expect(201);
    const id = created.body.id as number;

    const done = await request(app).patch(`/api/todos/${id}`).send({ done: true }).expect(200);
    assert.equal(done.body.done, true);

    await request(app).delete(`/api/todos/${id}`).expect(204);
    const list = await request(app).get("/api/todos").expect(200);
    assert.equal(list.body.find((t: { id: number }) => t.id === id), undefined);
  });
});
