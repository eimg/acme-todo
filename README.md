# Acme Todo

A minimal local todo list — one project, one list. Independent from Helix and Acme Issues; use those tools to drive work on this repo.

## Acme development testbed

Acme Todo is one of four related local projects. They remain separate products with separate responsibilities.

| Project | Local path | Role |
|---|---|---|
| **Primer** | `~/Desktop/acme/primer` | Knowledge product and fictional Acme evidence corpus; not currently part of the runtime loop. |
| **Helix** | `~/Desktop/acme/helix` | Agent workflow control plane that receives work and orchestrates changes. |
| **Acme Issues** | `~/Desktop/acme/acme-issues` | Local issue tracker and webhook harness that triggers Helix and receives callbacks. |
| **Acme Todo** | `~/Desktop/acme/acme-todo` | Disposable target application used for agent implementation and verification. |

Typical exercise: Acme Issues sends a work item to Helix, which makes and verifies changes in Acme Todo. Primer develops the separate knowledge and retrieval side of the same fictional Acme context.

## Quick start

```bash
cd ~/Desktop/acme/acme-todo
npm install
npm run dev
# → http://127.0.0.1:8330/
```

## API

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/todos` | List todos (open first, then done) |
| `POST` | `/api/todos` | `{ "text": "...", "priority": "low|medium|high" }` (priority optional, default "medium") |
| `PATCH` | `/api/todos/:id` | `{ "done": true }`, `{ "text": "..." }`, or `{ "priority": "high" }` |
| `DELETE` | `/api/todos/:id` | Remove todo |
| `DELETE` | `/api/todos/clear` | Remove all done todos |
| `GET` | `/api/hello` | Say hello |

Data is stored in `data/todos.db` (override with `ACME_TODO_DATA_DIR`).

## Manage with Helix + Acme Issues

This repo is the **target project** Helix works on. Helix is globally installed (`helix` CLI).

### 1. Initialize Helix in this repo

```bash
cd ~/Desktop/acme/acme-todo
helix init --preset express
export OPENROUTER_API_KEY=...
```

### 2. Run Helix on a task (inline)

```bash
cd ~/Desktop/acme/acme-todo
helix run --title "Add due dates to todos" --body "Store optional due date on each todo"
```

Or start the server UI:

```bash
helix serve
# → http://127.0.0.1:8319/
```

### 3. Track work in Acme Issues

In Acme Issues at `~/Desktop/acme/acme-issues`:

1. **Settings** → webhook URL `http://127.0.0.1:8319/runs`, enable webhooks
2. Create an issue with the `trigger` label describing the acme-todo task
3. Helix runs against **this directory** (start `helix serve` from `acme-todo`)
4. On success, Acme Issues closes the issue and adds a completion comment

### Ports

| Service | Default |
|---------|---------|
| Todo app | `8330` |
| Helix | `8319` |
| Acme Issues | `8320` |

## Development

```bash
npm run dev
npm test
npm run build
```
