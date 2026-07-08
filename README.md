# Todo App

A minimal local todo list — one project, one list. Independent from Helix and Local Issues; use those tools to drive work on this repo.

## Quick start

```bash
cd ~/Desktop/todo-app
npm install
npm run dev
# → http://127.0.0.1:8330/
```

## API

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/todos` | List todos (open first, then done) |
| `POST` | `/api/todos` | `{ "text": "..." }` |
| `PATCH` | `/api/todos/:id` | `{ "done": true }` or `{ "text": "..." }` |
| `DELETE` | `/api/todos/:id` | Remove todo |
| `GET` | `/api/hello` | Say hello |

Data is stored in `data/todos.db` (override with `TODO_APP_DATA_DIR`).

## Manage with Helix + Local Issues

This repo is the **target project** Helix works on. Helix is globally installed (`helix` CLI).

### 1. Initialize Helix in this repo

```bash
cd ~/Desktop/todo-app
helix init --preset express
export OPENROUTER_API_KEY=...
```

### 2. Run Helix on a task (inline)

```bash
cd ~/Desktop/todo-app
helix run --title "Add due dates to todos" --body "Store optional due date on each todo"
```

Or start the server UI:

```bash
helix serve
# → http://127.0.0.1:8319/
```

### 3. Track work in Local Issues

In [Local Issues](~/Desktop/local-issues):

1. **Settings** → webhook URL `http://127.0.0.1:8319/runs`, enable webhooks
2. Create an issue with the `trigger` label describing the todo-app task
3. Helix runs against **this directory** (start `helix serve` from `todo-app`)
4. On success, Local Issues closes the issue and adds a completion comment

### Ports

| Service | Default |
|---------|---------|
| Todo app | `8330` |
| Helix | `8319` |
| Local Issues | `8320` |

## Development

```bash
npm run dev
npm test
npm run build
```
