# Module 03: pi-agent-core

`@earendil-works/pi-agent-core` is where “LLM call” becomes “agent turn”.

Most of the tool and event semantics later consolidated in Module 06 are first encountered here.

## Recommended Pace

### First pass

Read these in order:

1. `../pi/packages/agent/README.md`
2. `../pi/packages/agent/src/types.ts`
3. `../pi/packages/agent/src/agent-loop.ts`
4. `../pi/packages/agent/src/agent.ts`
5. [`tests-to-read.md`](tests-to-read.md)

### Deep pass

Come back later for:

- `../pi/packages/agent/docs/agent-harness.md`

Treat `AgentHarness` as important evolving direction, not as the first thing you need in order to understand the stable turn engine.

## Stable Surface

The stable conceptual center of this package is:

- `AgentMessage`
- `Agent`
- `agentLoop()` / `agentLoopContinue()`
- turn lifecycle events
- tool execution lifecycle
- steering vs follow-up queues

## The Core Mental Model

An agent run is not “send prompt, get response”. It is:

- inject user or queued messages
- stream an assistant turn
- extract tool calls
- preflight tools
- execute tools
- append tool results
- decide whether another LLM turn should run
- only then stop or accept follow-up work

## The Two Loops Matter

Read `agent-loop.ts` with this in mind:

- the **inner loop** handles one assistant turn plus its tool execution chain
- the **outer loop** handles work that arrives only after the agent would otherwise stop

This is the cleanest explanation of why steering and follow-up are distinct.

## The Barrier That Matters

One subtle but important detail is the difference between:

- raw low-level loop observation
- the `Agent` class as a stateful, listener-aware wrapper

The `Agent` class treats assistant `message_end` handling as a barrier before tool preflight begins. That is critical for extensions or higher layers that need agent state to include the finalized assistant message before any tool work starts.

## Parallel Tool Execution

Deep understanding here means being able to explain two orderings at once:

- `tool_execution_end` events may reflect completion order
- persisted `toolResult` messages still follow assistant source order

That distinction is not accidental. It separates UI responsiveness from deterministic transcript construction.

## Why This Module Comes Before Most Product Logic

If you skip this layer and jump into `AgentSession`, you will misread product policy as if it were the turn engine itself.

The core job here is to understand what the generic agent loop already guarantees before `pi-coding-agent` starts adding session, extension, retry, and persistence policy on top.

## Evolving Direction: AgentHarness

`AgentHarness` is not the stable public center of this module yet, but it is important for understanding the direction of orchestration work.

Read `../pi/packages/agent/docs/agent-harness.md` as an architecture memo about:

- lifecycle phases
- turn snapshots
- save points
- pending session writes
- runtime config vs in-flight request state

Treat it as **evolving direction**, not as the final stable model.

## Required Exercises

- [Exercise 01: Minimal Agent Loop](exercises/exercise-01-minimal-loop.md)
- [Exercise 02: Parallel Tool Execution](exercises/exercise-02-parallel-tools.md)
- [Exercise 03: AgentHarness Reading](exercises/exercise-03-agent-harness-reading.md)

If you are on a first pass and want to preserve momentum, do Exercises 01 and 02 before Exercise 03.

## Stop Condition

Before moving on, you should be able to explain:

- the difference between the inner and outer loops
- why `AgentMessage` is richer than raw LLM message types
- why the `Agent` class adds semantics beyond the raw loop
- why tool completion order and transcript order are intentionally different
- what guarantees this layer gives before product policy is layered on top
- what problem `AgentHarness` is trying to solve beyond `Agent`
