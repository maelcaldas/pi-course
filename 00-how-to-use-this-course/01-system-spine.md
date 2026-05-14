# 00.01 The 20-Minute System Spine

Read this before you decompose the system by package.

The goal is not mastery. The goal is to get one short, stable movie of the machine into your head so later modules have somewhere to attach.

If you skip this and jump straight into the largest files in `packages/coding-agent`, you will see mechanics before you see ownership.

## The Spine in One Sentence

A user prompt enters `AgentSession`, gets product-level shaping and preflight, becomes an agent turn in `Agent` / `agentLoop`, streams through `pi-ai`, may execute tools, gets persisted through `SessionManager`, and is surfaced back up through the product event bus to the UI or host.

## The Five Files To Open

Open these in order. Do not try to understand every line.

1. `../pi/packages/coding-agent/src/core/agent-session.ts`
2. `../pi/packages/agent/src/agent.ts`
3. `../pi/packages/agent/src/agent-loop.ts`
4. `../pi/packages/ai/src/stream.ts`
5. `../pi/packages/coding-agent/src/core/session-manager.ts`

## First-Pass Trace

On the first pass, look only for these hand-offs:

1. **Product entry** — `AgentSession.prompt(...)`
   - The product layer decides whether input is a command, whether extensions transform it, whether auth/model state is valid, and whether compaction should run first.
2. **Turn hand-off** — `AgentSession` calls `Agent.prompt(...)`
   - This is where product policy hands control to the generic turn engine.
3. **Agent loop** — `Agent` drives `agentLoop()`
   - A user message becomes one or more assistant turns, with tool execution and queue handling in between.
4. **Provider stream** — `agentLoop()` calls into `pi-ai`
   - `pi-ai` normalizes provider output into structured streaming events.
5. **Persistence + surfacing** — `AgentSession` listens upward and writes session entries through `SessionManager`
   - The product owns persistence and session history; the lower layers do not write JSONL.

## Minimal Ownership Map

Keep only this mental map on first pass:

| Step | Primary owner | Why |
| --- | --- | --- |
| product preflight and prompt shaping | `pi-coding-agent` | product/session/policy logic |
| turn execution and tool lifecycle | `pi-agent-core` | generic turn engine |
| provider adaptation and stream normalization | `pi-ai` | model/provider boundary |
| persistence and session tree | `pi-coding-agent` | product-owned history model |
| rendering and interaction | `pi-tui` or another host | consumers of product events |

## What Not To Worry About Yet

Ignore these on the first pass:

- exact extension hook ordering
- exact queue semantics (`steer` vs `followUp`)
- compaction details
- tree navigation details
- provider-specific transforms
- TUI rendering internals

You will come back to all of them.

## Stop Condition

Stop when you can explain, from memory:

- where the prompt first becomes product logic,
- where product logic hands off to the generic agent loop,
- where provider streaming is normalized,
- who owns persistence,
- and why the UI is downstream of the event flow rather than the owner of it.

## Next Step

Now go to [`../01-foundations/README.md`](../01-foundations/README.md).

Later, when you want the full-fidelity version of this same flow, read [`../07-capstone/flow-a-worked-example.md`](../07-capstone/flow-a-worked-example.md).
