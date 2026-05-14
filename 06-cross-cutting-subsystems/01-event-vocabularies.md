# 06.01 Event Vocabularies

Pi has **three distinct event vocabularies**. They are related but not interchangeable. Confusing them is one of the most common ways contributors break invariants.

## The Three Vocabularies

| Vocabulary | Lives in | Shape | Audience |
| --- | --- | --- | --- |
| Streaming events | `pi-ai` | `text_*`, `thinking_*`, `toolcall_*`, `done`, `error` | Anyone consuming a single LLM call |
| Agent lifecycle events | `pi-agent-core` | `message_start`, `message_end`, `tool_execution_start`, `tool_execution_end`, queue/turn events | Anyone driving an agent run |
| Product event bus | `coding-agent` | session/runtime/UI events | Extensions, TUI, RPC clients |

The vocabularies are layered: agent events **wrap** streaming events; the product bus **wraps** agent events plus product-only events that have no agent-layer meaning (e.g. session replacement, settings changes).

## Source-Guided Path

Read in this order. Hold the layering in mind — each file emits events meaningful only at its own level.

1. `../pi/packages/ai/src/stream.ts` — the streaming event protocol
2. `../pi/packages/ai/src/types.ts` — `AssistantMessageEvent` shape
3. `../pi/packages/agent/src/types.ts` — `AgentEvent`, message lifecycle
4. `../pi/packages/agent/src/agent-loop.ts` — where streaming events are consumed and agent events are emitted
5. `../pi/packages/agent/src/agent.ts` — where agent events become subscribable on a stateful object
6. `../pi/packages/coding-agent/src/core/event-bus.ts` — product-level event bus
7. `../pi/packages/coding-agent/src/core/agent-session.ts` — search for `emit` / event-bus usage to see how product events are produced

## Reading Questions

Hold these while reading:

- Which streaming events have **no** corresponding agent-level event, and why is that intentional?
- Which agent events have **no** corresponding streaming source (e.g. queue events)?
- Where exactly is the boundary between "I am rendering a partial assistant message" and "I am reacting to a finalized message"?
- Which product-bus events would never make sense at the agent layer?

## The Critical Boundary

The `Agent` class enforces that **`message_end` is a barrier**: assistant state is finalized in the agent before any tool execution events fire. This was already noted in Module 03; here it is restated as a *cross-vocabulary* invariant:

- Streaming layer: `done` may fire while the agent is still about to run tools.
- Agent layer: `message_end` is the moment after which `state.messages` contains the finalized assistant message.
- Product layer: any event-bus consumer that needs the final assistant message must subscribe to the agent-layer `message_end`, not the streaming-layer `done`.

If you ever feel tempted to bridge a product consumer directly to a streaming event, stop and re-read this section.

## Ordering vs Causality

A frequent confusion: streaming events are ordered **within one assistant turn**; agent events are ordered **within one agent run**; product-bus events are ordered **within one session lifetime**.

None of these orderings imply each other across layers. In particular, `tool_execution_end` order reflects completion order, while persisted `toolResult` order reflects assistant source order. Module 03 already raised this; the cross-cutting framing is: *event ordering is per-vocabulary; never assume one vocabulary's ordering carries into another*.

## What To Be Able To Explain

- Name the three vocabularies and one event unique to each.
- Why `done` (streaming) is not the same milestone as `message_end` (agent).
- Why a tool-completion event and a persisted tool-result entry can disagree on order without anything being broken.
- Why product extensions that need finalized state should subscribe to agent-layer events rather than streaming events.
