# Capstone Flow A (Worked Example)

This is the calibration target for capstone deliverables. Your other flows should match this depth.

Flow A: a single user prompt becomes a completed assistant turn, possibly with tool calls, persisted to the session.

> Line numbers are accurate at the time of writing but the *responsibilities* are what matter. If line numbers drift, do not patch them — re-read the file.

## Summary (one paragraph)

A user prompt arrives at `AgentSession.prompt(text)`. The product layer expands templates, runs extension input/command hooks, validates model and auth, optionally triggers compaction, builds a `user` `AgentMessage`, runs `before_agent_start` to let extensions add context messages and modify the system prompt, then hands one or more messages to `Agent.prompt(messages)`. `Agent` calls `agentLoop()` (and `agentLoopContinue()` for follow-up work), which streams an assistant turn through `pi-ai`, finalizes the assistant message at `message_end` (the barrier), preflights and executes tool calls (parallel by default; mutations serialized through the file-mutation queue), appends `toolResult` messages in assistant source order, and re-enters the inner loop for any follow-up turn until the model emits `done` with no further tool calls and the queues are empty. Throughout, lifecycle events flow up through the agent layer to `AgentSession`, which writes JSONL entries via `SessionManager` and emits product-bus events to extensions and the TUI.

## Numbered Trace

1. **Entry.** `AgentSession.prompt(text, options)` — `packages/coding-agent/src/core/agent-session.ts` (around line 967).
2. **Slash-command shortcut.** If `text` starts with `/`, try `_tryExecuteExtensionCommand(text)`. If handled, return without touching the agent.
3. **Extension `input` event.** `_extensionRunner.emitInput(text, images, source)` may transform or fully handle the input. Possible outcomes: `handled` (return), `transform` (replace text/images), pass-through.
4. **Skill and template expansion.** `_expandSkillCommand` then `expandPromptTemplate` rewrite the user text deterministically.
5. **Streaming-busy branch.** If `this.isStreaming`, the message is **not** sent now — it is enqueued via `_queueSteer` or `_queueFollowUp` depending on `streamingBehavior`. This is where the *outer* loop's steering vs follow-up distinction (Module 03) becomes a product-level API.
6. **Pending bash flush.** `_flushPendingBashMessages()` ensures background tool output already accumulated is committed before the new turn.
7. **Model + auth preflight.** `this.model` must be set; `_modelRegistry.hasConfiguredAuth(this.model)` must succeed (with OAuth-specific guidance if not). This is the latest possible point at which a missing key is reported.
8. **Compaction check.** `_checkCompaction(lastAssistant, false)` runs *before* the new user message is pushed. This is why aborted prior responses do not stall future turns: compaction notices context pressure here. (Module 05.03.)
9. **Build user `AgentMessage`.** A `user` message with `TextContent` (and optional `ImageContent[]`) is constructed. Pending `nextTurn` messages from extensions are appended alongside it.
10. **`before_agent_start`.** `_extensionRunner.emitBeforeAgentStart(...)` chains extension handlers (Module 05.02). Each handler may add `custom` messages and modify the system prompt. The chained result is what becomes `agent.state.systemPrompt` for this turn (or the base prompt if no handler modified it).
11. **Hand-off to `Agent`.** `await this.agent.prompt(messages)` — `packages/agent/src/agent.ts`. From here on the layer is `pi-agent-core`.
12. **Inner loop start.** `Agent.prompt` invokes `agentLoop()` in `packages/agent/src/agent-loop.ts`. The loop streams the assistant turn through `pi-ai` (`stream()` in `packages/ai/src/stream.ts`).
13. **Streaming events.** `text_*`, `thinking_*`, `toolcall_*` events are consumed and re-emitted as agent-layer events (`message_start`, content updates, then `message_end` once `done` is observed). The TUI subscribes via the product bus and renders incrementally.
14. **Barrier at `message_end`.** Before any tool execution begins, `Agent` writes the finalized assistant message into `state.messages` and emits `message_end`. Any consumer needing the final message is now safe to read it. (Modules 03 and 06.01.)
15. **Tool preflight.** Each `toolCall` is validated against its TypeBox schema (`pi-ai`). Invalid calls become error tool results without execution.
16. **Tool execution.** Default policy is parallel. `tool_execution_start` / `tool_execution_end` fire in completion order. File-mutating tools (`edit`, `write`) are serialized through the file-mutation queue (`packages/coding-agent/src/core/tools/file-mutation-queue.ts`) even though others run concurrently. Long stdout flows through the output accumulator. (Module 06.02.)
17. **`toolResult` append.** When all tools for the turn have completed, results are appended to `state.messages` **in assistant source order**, not in completion order. This is the deliberate split between event ordering and transcript ordering. (Module 03.)
18. **Continuation decision.** If the assistant turn ended with tool calls, `agentLoop` runs another inner-loop iteration with the appended `toolResult` messages. Otherwise the inner loop ends.
19. **Outer loop / queues.** After the inner loop ends, `agentLoopContinue()` (or equivalent in `agent.ts`) checks the steering and follow-up queues populated in step 5. Steering messages join the next turn; follow-up messages start a new turn after the current one fully completes. The loop ends when the model returned `done` with no tool calls **and** both queues are empty.
20. **Persistence.** Throughout steps 13–18, `AgentSession` listens to agent events and writes JSONL entries via `SessionManager` (`packages/coding-agent/src/core/session-manager.ts`). Persistence ownership stays with the product layer; `Agent` writes nothing to disk. (Module 06.04.)
21. **Retry.** After `agent.prompt` resolves, `await this.waitForRetry()` resolves any retry promise installed by transport-level error handling. Retry is distinct from compaction: compaction is for context overflow, retry is for transport/provider failures. (Module 05.03.)
22. **`agent_end` extension event.** Extensions observing `agent_end` see the finalized message list for this run.
23. **Product-bus emission.** `AgentSession` emits its own session-level events through the event bus to TUI / RPC / extensions.
24. **Idle.** `isStreaming` becomes false. Any items queued in step 5 are now eligible to be drained as the next prompt.

## Sequence Diagram (text form)

```
User → AgentSession.prompt(text)
         │
         ├─ _tryExecuteExtensionCommand?           → return
         ├─ ExtensionRunner.emitInput              → handled? return / transform
         ├─ expandSkillCommand + expandPromptTemplate
         ├─ isStreaming? → _queueSteer / _queueFollowUp → return
         ├─ _flushPendingBashMessages
         ├─ model + auth preflight
         ├─ _checkCompaction(lastAssistant)
         ├─ build user AgentMessage (+ pending nextTurn msgs)
         ├─ ExtensionRunner.emitBeforeAgentStart   → custom msgs + system prompt
         └─ Agent.prompt(messages)
                 │
                 └─ agentLoop()  [INNER LOOP]
                         │
                         ├─ stream() via pi-ai
                         │     text_*, thinking_*, toolcall_*, done
                         ├─ finalize assistant message
                         ├─ emit message_end                [BARRIER]
                         ├─ preflight tool calls
                         ├─ execute tools (parallel; mutations serialized)
                         │     tool_execution_start/end (completion order)
                         ├─ append toolResults (source order)
                         └─ if more tool calls → next inner iteration
                 └─ agentLoopContinue()  [OUTER LOOP]
                         └─ drain steer / followUp queues
         │
         ├─ SessionManager appends JSONL entries (throughout)
         ├─ waitForRetry()
         ├─ ExtensionRunner.emit(agent_end)
         └─ product bus → TUI / RPC / extensions
```

## Invariants This Flow Protects

- The **`message_end` barrier**: agent state contains the finalized assistant message before any tool work begins.
- **Source order vs completion order** are deliberately distinct for tools.
- **One writer per file** for persistence: `SessionManager` only.
- **Append-only** session JSONL: no entry is rewritten; compaction adds a new summary entry.
- **Compaction ≠ retry**: context-pressure recovery is not failure recovery.
- **Auth resolved at request time**, not baked into the model object at construction.
- **Extensions cannot bypass the product layer** to reach the agent loop directly; tools and prompt changes are mediated.

## Stable vs Policy-Driven

- **Structurally stable.** The barrier semantics, source-order transcripts, and "one writer per file" invariants are core. They will outlive specific files moving.
- **Current implementation.** The exact split between what `AgentSession.prompt` does inline versus what `Agent` / `agentLoop` does is current shape; the `AgentHarness` direction wants to make turn boundaries and save points more explicit.
- **Policy-driven.** Streaming-busy queueing (`steer` vs `followUp`), compaction trigger thresholds, tool-result truncation policy, and retry classification are product policy you can tune without touching the agent loop.
- **Evolving.** Anything in `agent-harness.md` — lifecycle phases, save points, pending session writes, snapshot semantics. Read as direction, not as today's API.

## Use This As The Bar

For your remaining capstone flows (B, C, D), aim for:

- a one-paragraph summary,
- a numbered step trace tied to specific files,
- a sequence diagram (text or otherwise),
- a list of invariants,
- and an explicit stable / current / policy / evolving classification at the end.

If your flow notes have all five, you have demonstrated the level of understanding the course is trying to produce.
