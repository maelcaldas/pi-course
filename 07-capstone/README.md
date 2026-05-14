# Module 07: Capstone

The capstone should feel like assembly, not like your first serious synthesis task.

By the time you arrive here, you should already have:

- read the short system spine in Module 00
- traced the full prompt-to-turn worked flow (`flow-a-worked-example.md`) when ready
- used the tree-navigation worked flow (`flow-c-worked-example.md`) during Module 05, Part II

## Calibration: Worked Flows A and C

These are the calibration examples:

- [`flow-a-worked-example.md`](flow-a-worked-example.md) — prompt to completed assistant turn
- [`flow-c-worked-example.md`](flow-c-worked-example.md) — `/tree` navigation with branch summary

Together they are the bar for depth and structure.

## Required Capstone

Produce **one independent full flow note** at the same depth as the worked examples.

Use [`flow-template.md`](flow-template.md).

Good default choices:

- **Flow B** — extension startup and prompt shaping
- **Flow D** — compaction and recovery

You may also choose another real flow you care about.

## Optional Advanced Capstone

After the required flow, add one or two more if you want stronger contribution readiness.

That means:

- second independent flow = better comparative understanding
- third independent flow = strong evidence you can reason about changes safely

But these are optional. The mandatory path is one full independent flow done well.

## Suggested Order Inside This Module

1. re-read Flow A if the prompt/turn spine has gone fuzzy
2. re-read Flow C if tree/history semantics are fuzzy
3. pick one new flow only
4. write it using the template
5. answer the final architectural questions

## Recommended Flows

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

For the required flow, produce:

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

## Final Questions

By the end of this module, you should be able to answer:

- If a behavior changed, which layer should own that change?
- Which invariants in pi are structural, and which are product policy?
- Which areas of the system feel stable, and which feel intentionally still in motion?
