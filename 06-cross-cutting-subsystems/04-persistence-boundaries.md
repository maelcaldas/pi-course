# 06.04 Persistence Boundaries

Persistence in pi is a **product** concern, but it touches the agent layer in places that are easy to miss. This chapter is the cross-cutting view: who writes JSONL, when, and what is intentionally kept out.

## Source-Guided Path

1. `../pi/packages/coding-agent/docs/session-format.md`
2. `../pi/packages/coding-agent/src/core/session-manager.ts` — the only place that should append to the JSONL tree
3. `../pi/packages/coding-agent/src/core/agent-session.ts` — the only place that decides *when* persistence happens during a turn
4. `../pi/packages/agent/docs/agent-harness.md` — evolving direction: "pending session writes", save points, and turn snapshots
5. `../pi/packages/coding-agent/src/core/settings-manager.ts` — a different persistence subsystem with its own write queue

## Tests

- `../pi/packages/coding-agent/test/compaction-serialization.test.ts`
- `../pi/packages/coding-agent/test/agent-session-runtime-events.test.ts`
- `../pi/packages/coding-agent/test/settings-manager.test.ts`

## What Gets Persisted

Classify each of these for yourself before you read the source. Then check.

| Item | Persisted in JSONL? | Notes |
| --- | --- | --- |
| User messages | yes | tree entry |
| Assistant text | yes | tree entry |
| Assistant thinking blocks | depends | provider/model dependent; see `transform-messages.ts` |
| Tool calls | yes | as part of assistant message |
| Tool results | yes | tree entry, in assistant source order |
| Aborted/incomplete assistant message | partially | see chapter 03 |
| Model changes mid-session | yes | dedicated entry type |
| Thinking-level changes | yes | dedicated entry type |
| Compaction summaries | yes | dedicated entry type; original history is **not** rewritten |
| Branch summaries (`/tree`) | yes | attached at navigation point |
| Labels | yes | tree entry |
| Extension-specific entries | yes | extensions can contribute typed entries |
| Streaming partials | no | UI-only |
| TUI render state | no | UI-only |
| Settings | yes | separate file, separate manager |
| Auth credentials | yes (separate) | `AuthStorage`, not the session JSONL |

## The Cross-Cutting Invariants

1. **One writer per file.** `SessionManager` owns the session JSONL. `SettingsManager` owns settings. `AuthStorage` owns credentials. Crossing these is a bug.
2. **Append-only for sessions.** Compaction does not rewrite earlier entries; it appends a new summary entry that *runtime context construction* later honors.
3. **Persistence decisions are timed by `AgentSession`.** The `Agent` class does not write JSONL. This is why you can use `Agent` outside the product without a filesystem.
4. **Settings persistence is queued and flushable.** Reads can race writes; `flush()` is the explicit durability barrier.
5. **The evolving direction adds explicit save points.** `AgentHarness` makes the implicit "when do we write" into a stated lifecycle phase. Treat this as direction, not current API.

## Reading Questions

- Why is it important that `Agent` does not know about JSONL?
- What would break if compaction rewrote earlier entries instead of appending a summary?
- Why is `SettingsManager` async internally even though most call sites feel synchronous?
- What is the difference between a save point (evolving) and the current implicit write timing in `AgentSession`?
- Why are auth credentials kept out of the session JSONL?

## What To Be Able To Explain

- The persistence ownership map: session → `SessionManager`, settings → `SettingsManager`, auth → `AuthStorage`.
- Why session history is append-only even when meaning has changed (compaction, branch summaries).
- The split between "what the runtime context contains" and "what is on disk" (Module 05.03 said this; here it is the persistence view of the same invariant).
- Why `AgentHarness` save points are an attempt to make today's implicit timing explicit.
