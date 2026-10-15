#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { addTask, clearDone, completeTask, emptyList, formatList, parseList, removeTask, type TodoList } from "./todo.js";

const file = process.env.TODO_FILE ?? join(homedir(), ".todo.json");

const HELP = `Usage: todo <command>

  add <text>     Add a task
  list           Show all tasks (default)
  done <id>      Mark a task as done
  rm <id>        Remove a task
  clear          Remove all finished tasks

Tasks are stored in ${file} (override with TODO_FILE).`;

function load(): TodoList {
  return existsSync(file) ? parseList(readFileSync(file, "utf8")) : emptyList();
}

function save(list: TodoList): void {
  writeFileSync(file, JSON.stringify(list, null, 2) + "\n");
}

function parseId(value: string | undefined): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new Error("Please give a task number, e.g. todo done 2");
  return id;
}

function main(argv: string[]): void {
  const [command = "list", ...rest] = argv;
  switch (command) {
    case "add":
      save(addTask(load(), rest.join(" ")));
      break;
    case "done":
      save(completeTask(load(), parseId(rest[0])));
      break;
    case "rm":
      save(removeTask(load(), parseId(rest[0])));
      break;
    case "clear":
      save(clearDone(load()));
      break;
    case "list":
      break;
    case "help":
    case "--help":
    case "-h":
      console.log(HELP);
      return;
    default:
      throw new Error(`Unknown command "${command}". Try: todo help`);
  }
  console.log(formatList(load()));
}

try {
  main(process.argv.slice(2));
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
}
