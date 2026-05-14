# Notes: 06 Cross-Cutting Subsystems

Use this file as an owner-map and consolidation pass after Modules 02, 03, and 05. If it feels like first exposure, go back.

## Cross-cutting owner map

| Concern | First place I really saw it | Primary owner | Policy owner (if different) | Common confusion |
| --- | --- | --- | --- | --- |
| events | | | | |
| tools | | | | |
| abort | | | | |
| persistence | | | | |

## Event vocabularies

- streaming events (file):
- agent events (file):
- product-bus events (file):

One event unique to each:

- streaming:
- agent:
- product:

### Why `done` (streaming) ≠ `message_end` (agent)

## Tools subsystem

### Trace one `edit` call from `toolcall_*` to persisted `toolResult`

1.
2.
3.
4.

### Where parallel-safety is decided

### What the file-mutation queue prevents

### Why `toolResult` content can differ from streamed UI output

## Cancellation and abort

### The seven-step abort flow with file ownership

1. UI / SDK —
2. Agent layer —
3. `pi-ai` stream —
4. Tool implementations —
5. Agent loop finalization —
6. Product persistence —
7. UI idle —

### Why aborted assistant messages are special on cross-provider replay

## Persistence boundaries

### Persistence ownership map

- session JSONL →
- settings →
- auth →

### What is persisted vs UI-only (my classification)

| Item | Persisted? | Where |
| --- | --- | --- |
| user messages | | |
| assistant text | | |
| thinking blocks | | |
| tool calls | | |
| tool results | | |
| aborted assistant | | |
| compaction summary | | |
| branch summary | | |
| streaming partials | | |
| settings | | |
| auth | | |

### Why `Agent` does not write JSONL

### Save points (evolving) vs current implicit write timing
