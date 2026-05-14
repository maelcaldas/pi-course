# Cross-Cutting Subsystems Tests to Read

This module spans multiple packages, so the test reading is grouped by concern instead of by package.

## 06.01 Event Vocabularies

| Test | Why it matters |
| --- | --- |
| `../pi/packages/agent/test/agent-loop.test.ts` | The clearest source of truth for agent-layer event order, especially tool execution ordering and queue timing |
| `../pi/packages/coding-agent/test/agent-session-runtime-events.test.ts` | Shows the product-level session lifecycle events emitted above the agent layer |

## 06.02 The Tools Subsystem

| Test | Why it matters |
| --- | --- |
| `../pi/packages/agent/test/agent-loop.test.ts` | Shows tool execution semantics at the agent layer before product safety policy is added |
| `../pi/packages/coding-agent/test/file-mutation-queue.test.ts` | Best executable explanation of why file-mutating tools are serialized even when the agent loop runs tools in parallel |
| `../pi/packages/coding-agent/test/tools.test.ts` | Shows product-owned tool policy like truncation, timeout, abort, and shell behavior |

## 06.03 Cancellation and AbortSignal

| Test | Why it matters |
| --- | --- |
| `../pi/packages/ai/test/abort.test.ts` | Best provider-layer view of abort semantics and replay after an aborted assistant message |
| `../pi/packages/agent/test/agent.test.ts` | Shows abort propagation through the agent wrapper and to subscribers/stream functions |
| `../pi/packages/coding-agent/test/suite/agent-session-retry-events.test.ts` | Shows product behavior when aborted runs reach the session layer and why `agent_end` still matters |

## 06.04 Persistence Boundaries

| Test | Why it matters |
| --- | --- |
| `../pi/packages/coding-agent/test/compaction-serialization.test.ts` | Shows what is intentionally serialized for summarization and what gets truncated |
| `../pi/packages/coding-agent/test/agent-session-runtime-events.test.ts` | Helps separate session replacement lifecycle from on-disk session persistence |
| `../pi/packages/coding-agent/test/settings-manager.test.ts` | The clearest executable spec for the separate settings persistence subsystem |

## Reading Notes

As you read these tests, keep asking:

- Which event vocabulary is this test exercising?
- Is the behavior structural, or is it product policy layered on top?
- If this test failed, which package should probably be changed first?
