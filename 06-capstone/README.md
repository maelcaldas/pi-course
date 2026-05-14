# Module 06: Capstone

The primary capstone is now tracing real pi flows end-to-end.

Building a minimal clone is still useful, but it is secondary to understanding how the real system works today.

## Primary Capstone: Trace Real Pi Flows

Choose at least three flows and explain them in detail from source and tests.

Recommended flows:

### Flow A: Prompt to completed assistant turn

Trace:

- CLI or SDK entry
- `AgentSession.prompt()`
- `Agent.prompt()` / `agentLoop()`
- provider call
- tool execution
- message persistence
- final event emission

Suggested files:

- `../pi/packages/coding-agent/src/core/agent-session.ts`
- `../pi/packages/agent/src/agent.ts`
- `../pi/packages/agent/src/agent-loop.ts`

### Flow B: Extension startup and prompt shaping

Trace:

- resource discovery
- extension loading
- `before_agent_start`
- system prompt chaining
- provider-payload hooks

Suggested files:

- `../pi/packages/coding-agent/src/core/resource-loader.ts`
- `../pi/packages/coding-agent/src/core/extensions/runner.ts`
- `../pi/packages/coding-agent/docs/extensions.md`

### Flow C: `/tree` navigation with branch summary

Trace:

- current leaf and target node
- branch summary generation
- entry attachment point
- rebuilt runtime context

Suggested files:

- `../pi/packages/coding-agent/src/core/session-manager.ts`
- `../pi/packages/coding-agent/src/core/agent-session.ts`
- `../pi/packages/coding-agent/test/agent-session-tree-navigation.test.ts`

### Flow D: Compaction and recovery

Trace:

- context-pressure detection
- compaction preparation
- summary entry creation
- runtime context rebuild
- follow-up prompt continuity

Suggested files:

- `../pi/packages/coding-agent/docs/compaction.md`
- `../pi/packages/coding-agent/test/compaction.test.ts`
- `../pi/packages/coding-agent/src/core/agent-session.ts`

## Deliverable Format

For each chosen flow, produce:

1. a one-paragraph summary of the purpose of the flow
2. a sequence diagram or numbered step trace
3. a list of invariants the flow appears to protect
4. a short note on where the behavior is stable vs where it seems policy-driven or evolving

## Optional Secondary Capstone: Build mini-pi

If you want to internalize the architecture by reimplementation, keep the original “mini-pi” exercise as optional work.

Suggested minimal scope:

- `pi-ai` for model calls
- a simplified agent loop
- `read`, `write`, `edit`, `bash` tools
- minimal JSONL persistence
- a small terminal UI or print mode

Use the real source as reference, but do not aim for feature parity.

## Final Question

By the end of this module, you should be able to answer:

- If a behavior changed, which layer should own that change?
- Which invariants in pi are structural, and which are product policy?
- Which areas of the system feel stable, and which feel intentionally still in motion?
