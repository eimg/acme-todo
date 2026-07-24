# Acme Todo agent guide

Acme Todo is the disposable target application used to test Helix planning, implementation, and verification against a real repository.

## Related projects

| Project | Local path | Responsibility |
|---|---|---|
| Primer | `~/Desktop/acme/primer` | Knowledge product and fictional Acme evidence corpus; outside the Issues → Helix runtime loop. |
| Prelude | `~/Desktop/acme/prelude` | Project inception drafting and bootstrap artifact export for Helix empty-workspace bootstrap. |
| Helix | `~/Desktop/acme/helix` | Agent workflow control plane that receives work and orchestrates changes. |
| Acme Issues | `~/Desktop/acme/acme-issues` | Local issue tracker and webhook harness that triggers Helix and receives callbacks. |
| Acme Projects | `~/Desktop/acme/acme-projects` | Feature-idea and collaboration board for existing Helix repos; can manually create non-triggering issues through Acme Issues. |
| Acme Todo | `~/Desktop/acme/acme-todo` | Disposable target application used for agent implementation and verification. |

Existing-repo flow: Acme Issues → Helix → Acme Todo, followed by a Helix completion callback to Acme Issues. Primer shares the fictional Acme context but is not in that runtime path. Prelude is used when inventing a new project before a Helix repo exists.

Intended feature flow for this existing target begins with a ready Acme Projects card, continues through a linked Acme Issues implementation issue, and then reaches Helix. Acme Projects does not call Helix directly.

## Working rules

- Treat issue text delivered through Helix as the requested product change; do not modify the companion projects unless explicitly asked.
- Preserve existing user changes and the `.helix/` project configuration.
- Keep the app intentionally small and locally runnable.
- Use focused tests for requested behavior rather than expanding scope opportunistically.
- Before committing cross-cutting changes, run `npm test` and `npm run build`.
