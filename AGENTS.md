# Acme Todo agent guide

Acme Todo is the disposable target application used to test Helix planning, implementation, and verification against a real repository.

## Related projects

| Project | Local path | Responsibility |
|---|---|---|
| Primer | `~/Desktop/acme/primer` | Knowledge product and fictional Acme evidence corpus; not currently part of the runtime loop. |
| Helix | `~/Desktop/acme/helix` | Agent workflow control plane that receives work and orchestrates changes. |
| Acme Issues | `~/Desktop/acme/acme-issues` | Local issue tracker and webhook harness that triggers Helix and receives callbacks. |
| Acme Todo | `~/Desktop/acme/acme-todo` | Disposable target application used for agent implementation and verification. |

The normal local flow is Acme Issues → Helix → Acme Todo, followed by a Helix completion callback to Acme Issues. Primer shares the fictional Acme context but is not currently in that runtime path.

## Working rules

- Treat issue text delivered through Helix as the requested product change; do not modify the companion projects unless explicitly asked.
- Preserve existing user changes and the `.helix/` project configuration.
- Keep the app intentionally small and locally runnable.
- Use focused tests for requested behavior rather than expanding scope opportunistically.
- Before committing cross-cutting changes, run `npm test` and `npm run build`.
