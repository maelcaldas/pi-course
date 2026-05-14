# Capstone Flow C (Worked Example)

This is the calibration example for tree navigation with branch summary.

Read it during Module 05, Part II. Do not postpone it until the end of the course; it is the clearest narrative guide to session-tree behavior.

Flow C: the user navigates to another point in the session tree, optionally preserving the abandoned branch as a summary attached at the navigation target.

## Summary (one paragraph)

A caller invokes `AgentSession.navigateTree(targetId, options)`. The method captures the old leaf, verifies the target exists, and collects the entries on the branch being left by walking from the old leaf back to the common ancestor with the target. If summarization is enabled, extensions get the first chance to cancel, override instructions, or supply their own summary via `session_before_tree`; otherwise the default branch summarizer converts the abandoned branch into LLM-compatible messages, serializes them to text, and asks the model for a compact structured summary. The navigation target is then interpreted differently depending on its type: user and custom messages are treated as editable prompts, so the new leaf becomes their parent and the original text is returned to the editor; non-user entries are treated as navigable positions, so the new leaf is the selected node itself. If a summary was produced, `SessionManager.branchWithSummary(newLeafId, ...)` attaches a `branch_summary` entry at the navigation target position and that summary entry becomes the new leaf. Finally, `AgentSession` rebuilds runtime context from the JSONL tree with `buildSessionContext()`, updates `agent.state.messages`, and emits `session_tree` so the rest of the product sees the new branch state.

## Numbered Trace

1. **Entry.** `AgentSession.navigateTree(targetId, options)` in `packages/coding-agent/src/core/agent-session.ts`.
2. **Capture old state.** Read `oldLeafId = sessionManager.getLeafId()`. If `targetId === oldLeafId`, return immediately as a no-op.
3. **Preconditions.** If `options.summarize` is true and there is no active model, throw. Then resolve `targetEntry = sessionManager.getEntry(targetId)`; if missing, throw.
4. **Collect abandoned-branch entries.** Call `collectEntriesForBranchSummary(sessionManager, oldLeafId, targetId)` in `packages/coding-agent/src/core/compaction/branch-summarization.ts`.
5. **Find the common ancestor.** `collectEntriesForBranchSummary` compares the old path and target path, finds the deepest shared node, and walks backward from the old leaf until that ancestor. The returned entries are in chronological order.
6. **Prepare mutable navigation state.** `navigateTree()` builds a `preparation` object containing `targetId`, `oldLeafId`, `commonAncestorId`, `entriesToSummarize`, `userWantsSummary`, custom instructions, replacement flag, and label.
7. **Install abort controller.** `AgentSession` creates `_branchSummaryAbortController` so the summarization phase can be cancelled independently.
8. **Extension interception.** If any extension handles `session_before_tree`, it sees the preparation object plus the abort signal. It may:
   - cancel the navigation,
   - override instructions or label,
   - provide a custom summary directly.
9. **Default summarizer path.** If summarization is still desired, there are entries to summarize, and no extension provided a summary, `navigateTree()` resolves request auth for the current model and calls `generateBranchSummary(entriesToSummarize, options)`.
10. **Budgeting the abandoned branch.** `generateBranchSummary()` first calls `prepareBranchEntries(entries, tokenBudget)`, which keeps the newest abandoned-branch messages that fit in the token budget and carries file-operation data forward from nested summaries.
11. **Convert abandoned branch to text.** `prepareBranchEntries()` returns `AgentMessage[]`; `generateBranchSummary()` converts them with `convertToLlm()`, then serializes them with `serializeConversation()` so the model summarizes them as history instead of treating them as a dialogue to continue.
12. **LLM summary call.** `generateBranchSummary()` calls `completeSimple()` with `SUMMARIZATION_SYSTEM_PROMPT` plus a structured branch-summary prompt. On success, it prepends a branch-summary preamble and appends tracked file-operation lists.
13. **Abort/error handling.** If the summarizer returns `aborted`, `navigateTree()` returns `{ cancelled: true, aborted: true }` without changing the session tree. If the summarizer errors, `navigateTree()` throws and the old leaf remains intact.
14. **Interpret target semantics.** Back in `navigateTree()`, the target is classified:
   - **user message** → `newLeafId = targetEntry.parentId`, return the user text as `editorText`
   - **custom_message** → `newLeafId = targetEntry.parentId`, return text content as `editorText`
   - **anything else** → `newLeafId = targetId`, no editor text
15. **Why user-message navigation moves to the parent.** This is not a bug. Navigating to a user message means “resume from before this prompt and let the editor hold its text”, not “keep the prompt as already-consumed conversation state.”
16. **Apply tree switch with summary.** If `summaryText` exists, call `sessionManager.branchWithSummary(newLeafId, summaryText, summaryDetails, fromExtension)`.
17. **Attachment rule.** `branchWithSummary()` first moves the leaf to `newLeafId`, then appends a `branch_summary` entry as a child of that position. That summary entry becomes the new leaf. This is why the summary is attached at the navigation target position, not appended onto the abandoned branch.
18. **No-summary path.** If no summary exists:
   - `newLeafId === null` → `sessionManager.resetLeaf()`
   - otherwise → `sessionManager.branch(newLeafId)`
19. **Label handling.** If a label was requested, it is attached to the summary entry when summarizing, otherwise to the target entry itself.
20. **Rebuild runtime context.** `sessionContext = sessionManager.buildSessionContext()` and then `agent.state.messages = sessionContext.messages`.
21. **This is the key persistence/runtime split.** No old history is deleted. The JSONL tree stays append-only. The runtime message list changes because the active leaf changed and a summary entry may have been appended.
22. **Emit product event.** `navigateTree()` emits `session_tree` with the new leaf, old leaf, and optional `summaryEntry`.
23. **Return editor state.** The method returns `{ editorText?, cancelled: false, summaryEntry? }` so the caller can restore prompt text to the editor when appropriate.

## Sequence Diagram (text form)

```text
User / UI → AgentSession.navigateTree(targetId, summarize?)
              │
              ├─ oldLeafId = SessionManager.getLeafId()
              ├─ targetEntry = SessionManager.getEntry(targetId)
              ├─ collectEntriesForBranchSummary(oldLeafId, targetId)
              │     └─ abandoned branch entries + commonAncestorId
              ├─ emit session_before_tree
              │     ├─ cancel? → return cancelled
              │     └─ custom summary? / override instructions?
              ├─ default summary?
              │     ├─ prepareBranchEntries()
              │     ├─ convertToLlm()
              │     ├─ serializeConversation()
              │     └─ completeSimple() for structured summary
              ├─ classify target entry
              │     ├─ user/custom → newLeaf = parent, editorText = original text
              │     └─ non-user → newLeaf = targetId
              ├─ summary?
              │     ├─ yes → SessionManager.branchWithSummary(newLeaf, ...)
              │     └─ no  → SessionManager.branch(...) / resetLeaf()
              ├─ buildSessionContext()
              ├─ agent.state.messages = rebuilt context
              ├─ emit session_tree
              └─ return { editorText?, summaryEntry? }
```

## Invariants This Flow Protects

- **Append-only session history.** Tree navigation does not rewrite old entries; it changes the active leaf and may append a `branch_summary` entry.
- **Editable-prompt semantics for user targets.** Navigating to a user message means “put the prompt back in the editor and resume from before it.”
- **Attachment at target position.** Branch summaries are attached where the new branch resumes, not where the abandoned branch ended.
- **Abort safety.** If summarization is aborted or cancelled, the session tree and current leaf remain unchanged.
- **Runtime context derives from the tree.** After navigation, `agent.state.messages` is rebuilt from `buildSessionContext()` instead of patched manually.
- **Extensions can shape the flow without owning the tree.** They can cancel or customize summarization, but `SessionManager` remains the tree owner.

## Stable vs Current vs Policy vs Evolving

- **Structurally stable.** Session trees, editable-prompt semantics for user targets, and append-only branch summaries are core architectural ideas.
- **Current implementation.** The exact split between `navigateTree()`, `collectEntriesForBranchSummary()`, `generateBranchSummary()`, and `SessionManager.branchWithSummary()` is current file layout.
- **Policy-driven.** Whether to summarize at all, the summarization prompt, token reserve, labels, and extension overrides are product policy.
- **Evolving.** Any future move of lifecycle/persistence timing into `AgentHarness` may change orchestration details, but not the core idea that navigation changes the active branch and optionally appends a summary entry.

## Use This As The Bar

For your own capstone flows, match this structure:

- summary
- numbered step trace tied to real files
- sequence diagram
- invariants
- stable / current / policy / evolving classification
