# Exercise 01: Layer Ownership

## Goal

Train the core architectural reflex: when you see a behavior in pi, decide which layer should own it and why.

## Instructions

For each concern below, name:

1. the **primary owning layer**
2. one **adjacent layer** that it necessarily touches
3. why the adjacent layer should *not* become the primary owner

Use these layer names only:

- `pi-ai`
- `pi-agent-core`
- `pi-tui`
- `pi-coding-agent`

## Concerns

1. Normalizing provider-specific streaming chunks into a unified event stream
2. Deciding whether two tool calls should execute in parallel
3. Rendering a modal overlay centered over existing terminal content
4. Persisting a model change in the session file
5. Building the effective system prompt from context files, skills, and extensions
6. Converting a partially streamed assistant response into a finalized assistant message
7. Deciding how much `bash` output should be kept for the model context
8. Reconstructing the active conversation branch from JSONL entries
9. Positioning the hardware cursor correctly for IME input
10. Transforming prior assistant reasoning content so another provider can consume it

## Deliverable

Write your answers as a table:

| Concern | Primary owner | Adjacent layer | Why ownership stays with primary |
| --- | --- | --- | --- |

## Good Signs

You are doing this exercise well if your answers consistently preserve:

- `pi-ai` as the provider/LLM boundary
- `pi-agent-core` as the turn/tool-execution boundary
- `pi-tui` as the rendering/input boundary
- `pi-coding-agent` as the product/session/policy boundary

## Follow-Up Question

After you finish, ask yourself:

- Which concerns felt ambiguous?
- Were they ambiguous because the architecture is genuinely cross-cutting, or because your layer boundaries are still fuzzy?
