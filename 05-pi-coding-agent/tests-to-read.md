# pi-coding-agent Tests to Read

Use this file in two passes, matching the two-pass structure of Module 05.

## Pass I — Runtime Assembly and Prompt Shaping

| Test | Why it matters |
| --- | --- |
| `../pi/packages/coding-agent/test/model-registry.test.ts` | Shows how built-in and custom model/provider configuration are merged and resolved |
| `../pi/packages/coding-agent/test/settings-manager.test.ts` | Shows settings merge, persistence, and externally edited file preservation semantics |
| `../pi/packages/coding-agent/test/resource-loader.test.ts` | Best executable map of discovery, precedence, collisions, and symlink behavior |
| `../pi/packages/coding-agent/test/extensions-runner.test.ts` | Best executable map of extension behavior, collisions, and handler composition |
| `../pi/packages/coding-agent/test/agent-session-runtime-events.test.ts` | Shows session replacement/runtime lifecycle events above the generic agent layer |

## Pass II — Session History, Tree Navigation, and Context Pressure

| Test | Why it matters |
| --- | --- |
| `../pi/packages/coding-agent/test/compaction.test.ts` | Deterministic unit view of cut points, summaries, and session-context rebuilding |
| `../pi/packages/coding-agent/test/compaction-serialization.test.ts` | Shows what compaction serializes for summarization and what is intentionally truncated |
| `../pi/packages/coding-agent/test/agent-session-tree-navigation.test.ts` | End-to-end picture of branch summary behavior, editor-text semantics, and navigation outcomes |

## Optional API-Key / E2E Reading

These are useful, but not required:

- `../pi/packages/coding-agent/test/agent-session-compaction.test.ts`
- `../pi/packages/coding-agent/test/suite/agent-session-retry-events.test.ts`

Read them after the deterministic tests.
