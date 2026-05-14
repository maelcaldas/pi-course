# Exercise 1: Minimal Agent Loop

Implement a minimal agent loop using only `pi-ai` (no `pi-agent-core`).

## Requirements

1. Create a loop that sends user messages to the LLM
2. Handle tool calls by executing them
3. Send tool results back to the LLM
4. Repeat until no more tool calls

## Constraints

- Do not use `Agent` or `agentLoop` from `pi-agent-core`
- Use only `stream()` or `complete()` from `pi-ai`
- Support at least `read` and `bash` tools

## Expected Behavior

```
$ tsx minimal-loop.ts "List files in src/"
Tool: bash({"command":"ls src/"})
Result: index.ts\nutils.ts\n
Assistant: The src directory contains index.ts and utils.ts.
```

## Hints

- A `Context` object holds the conversation state
- After each LLM response, check `content` for `toolCall` blocks
- Execute tools and append `toolResult` messages to the context
- Continue the loop if there were tool calls

## Diff Step (required)

After your loop works, open `../pi/packages/agent/src/agent-loop.ts` and **diff your loop against it in writing**. Produce a list of every concern the real loop handles that yours does not. Expect at least:

- abort / `AbortSignal` propagation
- preflight before tool execution
- the `message_end` barrier (assistant state finalized before tool work)
- parallel vs sequential tool execution policy
- tool-result ordering vs tool-completion ordering
- queue handling (steering vs follow-up) — the outer loop
- structured lifecycle events instead of `console.log`
- error/retry classification
- transform of prior assistant messages on replay (see `transform-messages.ts`)

Deliverable: a short note titled “What my minimal loop does not handle, and which file in pi handles it”. This is the actual learning artifact for this exercise.
