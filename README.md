# ts-todo-cli

A tiny command-line to-do list written in TypeScript. No runtime dependencies.

```
$ todo add "write the report"
 1. [ ] write the report
$ todo add "email Sam"
 1. [ ] write the report
 2. [ ] email Sam
$ todo done 1
 1. [x] write the report
 2. [ ] email Sam
```

## Use

```bash
npm install
npm run build
node dist/cli.js add "buy milk"
node dist/cli.js list
```

| Command | What it does |
|---|---|
| `add <text>` | Add a task |
| `list` | Show all tasks (the default) |
| `done <id>` | Mark a task as done |
| `rm <id>` | Remove a task |
| `clear` | Remove all finished tasks |

Tasks are saved in `~/.todo.json`. Set `TODO_FILE` to use a different file. To type `todo` instead of `node dist/cli.js`, run `npm link` once.

## How it's organized

- `src/todo.ts`: pure functions that never touch the disk, so they're easy to test
- `src/cli.ts`: reads arguments, loads and saves the file, prints output
- `src/todo.test.ts`: unit tests plus one end-to-end test of the real CLI

## Test

```bash
npm test
```

## License

MIT
