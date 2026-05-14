# pi-coding-agent Tests to Read

Read by topic, not just in file order.

## Runtime and infrastructure

| Test | Why it matters |
| --- | --- |
| `../pi/packages/coding-agent/test/model-registry.test.ts` | Shows how built-in and custom model/provider configuration are merged and resolved |
| `../pi/packages/coding-agent/test/settings-manager.test.ts` | Shows settings merge, persistence, and externally edited file preservation semantics |

## Extensions and resources

| Test | Why it matters |
| --- | --- |
| `../pi/packages/coding-agent/test/resource-loader.test.ts` | Best executable map of discovery, precedence, collisions, and symlink behavior |
| `../pi/packages/coding-agent/test/extensions-runner.test.ts` | Best executable map of extension behavior, collisions, and handler composition |

## Sessions, compaction, and tree navigation

| Test | Why it matters |
| --- | --- |
| `../pi/packages/coding-agent/test/compaction.test.ts` | Deterministic unit view of cut points, summaries, and session-context rebuilding |
| `../pi/packages/coding-agent/test/agent-session-tree-navigation.test.ts` | End-to-end picture of branch summary behavior and navigation outcomes |

## Optional API-Key / E2E Reading

These are useful, but not required:

- `../pi/packages/coding-agent/test/agent-session-compaction.test.ts`
- `../pi/packages/coding-agent/test/agent-session-retry.test.ts`

Read them after the deterministic tests.
