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
