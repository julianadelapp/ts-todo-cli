export interface Task {
  id: number;
  text: string;
  done: boolean;
  createdAt: string;
}

export interface TodoList {
  nextId: number;
  tasks: Task[];
}

export const emptyList = (): TodoList => ({ nextId: 1, tasks: [] });

export function addTask(list: TodoList, text: string, now = new Date()): TodoList {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Task text cannot be empty");
  const task: Task = { id: list.nextId, text: trimmed, done: false, createdAt: now.toISOString() };
  return { nextId: list.nextId + 1, tasks: [...list.tasks, task] };
}

function requireTask(list: TodoList, id: number): Task {
  const task = list.tasks.find((t) => t.id === id);
  if (!task) throw new Error(`No task with id ${id}`);
  return task;
}

export function completeTask(list: TodoList, id: number): TodoList {
  requireTask(list, id);
  return { ...list, tasks: list.tasks.map((t) => (t.id === id ? { ...t, done: true } : t)) };
}

export function removeTask(list: TodoList, id: number): TodoList {
  requireTask(list, id);
  return { ...list, tasks: list.tasks.filter((t) => t.id !== id) };
}

export function clearDone(list: TodoList): TodoList {
  return { ...list, tasks: list.tasks.filter((t) => !t.done) };
}

export function formatList(list: TodoList): string {
  if (list.tasks.length === 0) return "Nothing to do. Add a task with: todo add \"buy milk\"";
  return list.tasks.map((t) => `${String(t.id).padStart(2)}. [${t.done ? "x" : " "}] ${t.text}`).join("\n");
}

/** Validates data read from disk so a corrupted file can't crash the app. */
export function parseList(raw: string): TodoList {
  const data = JSON.parse(raw) as Partial<TodoList>;
  if (typeof data.nextId !== "number" || !Array.isArray(data.tasks)) throw new Error("Invalid todo file");
  const tasks = data.tasks.filter(
    (t): t is Task => !!t && typeof t.id === "number" && typeof t.text === "string" && typeof t.done === "boolean",
  );
  return { nextId: data.nextId, tasks };
}
