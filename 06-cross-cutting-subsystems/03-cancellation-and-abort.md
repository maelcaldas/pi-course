# 06.03 Cancellation and AbortSignal

Cancellation is end-to-end or it is broken. A working abort means: the in-flight provider stream stops, any running tool stops, the agent loop unwinds cleanly, the UI returns to an idle state, and the session on disk is left in a consistent state.

This chapter pulls those concerns together because they live in different files.

## Source-Guided Path

1. `../pi/packages/ai/src/stream.ts` — search for `AbortSignal` / `signal` usage in the streaming entry points
2. `../pi/packages/ai/src/providers/transform-messages.ts` — understand what gets replayed if a turn is aborted mid-stream
3. `../pi/packages/agent/src/agent-loop.ts` — search for `signal`, `aborted`, and the boundaries between turns
4. `../pi/packages/agent/src/agent.ts` — how `Agent` exposes cancellation to its consumers
5. `../pi/packages/coding-agent/src/core/agent-session.ts` — how product-level abort interacts with retry, compaction, and persistence
6. `../pi/packages/coding-agent/src/core/tools/bash.ts` — a real example of a tool that must honor `signal`

## Reading Questions

- Where does the `AbortSignal` originate in interactive use? In SDK / RPC use?
- What happens to a partially streamed assistant message when the user aborts mid-turn?
- What happens to in-flight tool executions when the assistant turn is aborted?
- Is an aborted turn persisted? In what shape?
- How does `transform-messages.ts` treat an incomplete or errored prior assistant message on the next turn?

## The End-to-End Picture

A correct abort flows like this:

1. **UI / SDK** triggers an `AbortController.abort()`.
2. **Agent layer** stops scheduling further tool work and signals any in-flight tool executions.
3. **`pi-ai` stream** propagates the abort to the provider transport and ends the event stream.
4. **Tool implementations** observe `signal.aborted` and clean up (kill child processes, close file handles).
5. **Agent loop** finalizes whatever assistant message exists and emits the appropriate lifecycle events.
6. **Product layer** persists what should be persisted (and intentionally does not persist what should not be).
7. **UI** returns to idle.

Missing any one of these steps creates a class of bug:

- Step 3 missing → zombie provider streams burning tokens.
- Step 4 missing → orphaned `bash` processes.
- Step 6 incorrect → unreplayable session on resume, or replayable session that confuses the next turn.

## The Replay Concern

The most subtle interaction is between cancellation and the **next** turn. `transform-messages.ts` exists in part because an aborted assistant message must not be replayed to a different provider as if it were normal history. If you change abort behavior, you may also be changing replay behavior on the next prompt without realizing it.

## What To Be Able To Explain

- The seven-step end-to-end abort flow above, with the file that owns each step.
- Why aborted assistant messages are a special case for cross-provider replay.
- Why tool implementations — not just the agent loop — must honor `AbortSignal`.
- Which subsystem is responsible for ensuring an aborted turn leaves a consistent on-disk session.
