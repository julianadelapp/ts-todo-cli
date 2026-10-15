import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { addTask, clearDone, completeTask, emptyList, formatList, parseList, removeTask } from "./todo.js";

test("add assigns increasing ids and trims text", () => {
  let list = addTask(emptyList(), "  buy milk ");
  list = addTask(list, "call mom");
  assert.deepEqual(list.tasks.map((t) => [t.id, t.text]), [[1, "buy milk"], [2, "call mom"]]);
});

test("add rejects empty text", () => {
  assert.throws(() => addTask(emptyList(), "   "), /empty/);
});

test("complete, remove and clear work and do not mutate the original", () => {
  const start = addTask(addTask(emptyList(), "a"), "b");
  const done = completeTask(start, 1);
  assert.equal(start.tasks[0]?.done, false);
  assert.equal(done.tasks[0]?.done, true);
  assert.deepEqual(clearDone(done).tasks.map((t) => t.text), ["b"]);
  assert.deepEqual(removeTask(done, 2).tasks.map((t) => t.text), ["a"]);
});

test("unknown ids throw", () => {
  assert.throws(() => completeTask(emptyList(), 9), /No task with id 9/);
  assert.throws(() => removeTask(emptyList(), 9), /No task/);
});

test("ids are never reused after removal", () => {
  let list = addTask(emptyList(), "a");
  list = removeTask(list, 1);
  assert.equal(addTask(list, "b").tasks[0]?.id, 2);
});

test("formatList shows state and an empty-list hint", () => {
  assert.match(formatList(emptyList()), /Nothing to do/);
  const list = completeTask(addTask(addTask(emptyList(), "a"), "b"), 1);
  assert.equal(formatList(list), " 1. [x] a\n 2. [ ] b");
});

test("parseList rejects bad files and drops malformed tasks", () => {
  assert.throws(() => parseList('{"nope":1}'), /Invalid/);
  assert.equal(parseList('{"nextId":3,"tasks":[{"id":1,"text":"ok","done":false,"createdAt":"x"},{"id":"bad"}]}').tasks.length, 1);
});

test("CLI end to end", () => {
  const cli = fileURLToPath(new URL("./cli.js", import.meta.url));
  const env = { ...process.env, TODO_FILE: join(mkdtempSync(join(tmpdir(), "todo-")), "t.json") };
  const run = (...args: string[]) => execFileSync("node", [cli, ...args], { env, encoding: "utf8" });
  run("add", "write", "tests");
  run("add", "ship it");
  assert.match(run("done", "1"), /\[x\] write tests/);
  assert.doesNotMatch(run("clear"), /write tests/);
  const bad = spawnSync("node", [cli, "done", "abc"], { env, encoding: "utf8" });
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /task number/);
});
