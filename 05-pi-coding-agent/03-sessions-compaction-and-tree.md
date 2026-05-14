# 05.03 Sessions, Compaction, and Tree Navigation

This is Module 05, Pass II.

Do not start here until runtime assembly, resource loading, and extension composition feel stable. This chapter is easier once you already know how a run is assembled.

This chapter covers the persistent memory model of pi and the runtime transforms that keep long sessions usable.

## Read This Worked Flow First

- [`../07-capstone/flow-c-worked-example.md`](../07-capstone/flow-c-worked-example.md)

Treat that file as the narrative guide for this chapter, not as something to postpone until the end of the course.

## Source-Guided Path

Read these in order:

1. `../pi/packages/coding-agent/docs/session-format.md`
2. `../pi/packages/coding-agent/docs/compaction.md`
3. `../pi/packages/coding-agent/src/core/session-manager.ts`
4. `../pi/packages/coding-agent/src/core/agent-session.ts`
5. `../pi/packages/coding-agent/test/compaction.test.ts`
6. `../pi/packages/coding-agent/test/agent-session-tree-navigation.test.ts`
7. optional: `../pi/packages/coding-agent/test/agent-session-compaction.test.ts`

## SessionManager Is The Memory Model

The most important thing to internalize is that sessions are not “a file of messages”.

They are a tree of entries containing:

- messages
- model changes
- thinking-level changes
- compaction entries
- branch summaries
- labels
- extension-specific entries

`buildSessionContext()` reconstructs the current runtime context by walking the active branch.

## Compaction

Compaction is a runtime strategy for context pressure. It is not history rewriting.

Key ideas:

- compaction writes a summary entry
- the summary plus the kept tail of the branch become the new runtime context
- full historical data remains in the JSONL tree
- repeated compaction is iterative, not a one-shot replacement of all prior meaning

Read `compaction.test.ts` closely. It is the best deterministic explanation of cut points, token accounting, and context rebuilding.

## Branch Summaries and `/tree`

Tree navigation is not just “move pointer to older message”.

When requested, pi can summarize the abandoned branch and attach that summary at the navigation point so the new branch retains context from the path you left.

This is what makes the session tree a working cognitive structure instead of just a history graph.

## AgentSession Owns the Product Policy Around These Features

`AgentSession` decides when these mechanics run in product terms:

- when compaction should be checked
- how manual compaction is triggered
- how tree navigation returns editor text vs not
- how retry interacts with post-turn state

The session manager provides the tree mechanics. `AgentSession` provides the product behavior.

## Retry vs Compaction

One subtle but important distinction in `AgentSession`:

- context overflow is a compaction problem
- many transport/provider failures are retry problems

Understanding where that line is drawn helps explain why compaction and retry are separate subsystems even though both often happen “after something went wrong”.

## What To Be Able To Explain

- Why sessions are trees rather than linear transcripts
- How `buildSessionContext()` reconstructs runtime messages from the tree
- Why compaction is safe even though it is lossy
- How branch summaries preserve context across navigation
- Why retry and compaction are adjacent but distinct recovery mechanisms
