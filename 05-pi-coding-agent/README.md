# Module 05: pi-coding-agent — The Interactive CLI

## What It Is

`@earendil-works/pi-coding-agent` is the full interactive CLI product. It ties together `pi-ai`, `pi-agent-core`, and `pi-tui` and adds:

- Session management (persistence, branching, forking, cloning)
- Compaction (manual and automatic)
- Extensions (custom tools, commands, UI, events)
- Skills (on-demand capability packages)
- Prompt templates (reusable prompts)
- Themes (dark/light/custom)
- Package management (install from npm or git)
- Multiple run modes (interactive, print, JSON, RPC)

## Architecture

```
main.ts
  ├── CLI argument parsing
  ├── Session resolution (create, resume, fork, continue)
  ├── Runtime factory (lazy — created after session is known)
  └── Mode dispatch
        ├── InteractiveMode → TUI + AgentSession
        ├── PrintMode → stdout + AgentSession
        ├── JSONMode → JSON lines + AgentSession
        └── RPCMode → stdin/stdout JSON-RPC

AgentSession
  ├── Wraps Agent (from pi-agent-core)
  ├── Manages model, thinking level, tools
  ├── Handles prompting, steering, follow-up
  ├── Persists messages via SessionManager
  ├── Auto-compaction and retry logic
  └── Extension event routing

InteractiveMode
  ├── TUI setup
  ├── Message renderer (streaming text, tool output)
  ├── Editor component (user input)
  ├── Slash command handling
  └── Footer (tokens, cost, context usage)
```

## Core Abstractions

### AgentSession

`AgentSession` is the bridge between `Agent` (pi-agent-core) and the rest of the coding agent. It:
- Subscribes to agent events and forwards them to UI listeners
- Persists messages to the session file
- Manages the model registry and auth
- Handles skill expansion and prompt template substitution
- Routes extension events
- Implements auto-compaction and retry logic

### SessionManager

`SessionManager` handles session persistence:
- Reads/writes JSONL session files
- Supports branching via `parentId` references
- Manages session metadata (model, thinking level, name)
- Provides session listing and search

### ExtensionRunner

`ExtensionRunner` manages extensions:
- Loads extension factories from files
- Registers tools, commands, event handlers
- Provides the `ExtensionAPI` (`pi` object) to extensions
- Emits events to all registered handlers

### ResourceLoader

`ResourceLoader` discovers and loads:
- Extensions (`.pi/extensions/`, `~/.pi/agent/extensions/`)
- Skills (`.pi/skills/`, `~/.pi/agent/skills/`)
- Prompt templates (`.pi/prompts/`, `~/.pi/agent/prompts/`)
- Themes (`.pi/themes/`, `~/.pi/agent/themes/`)
- Context files (`AGENTS.md`, `CLAUDE.md`)

## Deep Dive: Key Mechanisms

### Session Persistence

Sessions are stored as JSONL files. Each line is an entry:

```jsonl
{"type":"session","version":3,"id":"sess-abc123","timestamp":"2024-12-03T14:00:00.000Z","cwd":"/home/user/project"}
{"type":"model_change","id":"a1b2c3d4","parentId":null,"timestamp":"2024-12-03T14:00:01.000Z","provider":"anthropic","modelId":"claude-sonnet-4-5"}
{"type":"thinking_level_change","id":"b2c3d4e5","parentId":"a1b2c3d4","timestamp":"2024-12-03T14:00:02.000Z","thinkingLevel":"medium"}
{"type":"message","id":"c3d4e5f6","parentId":"b2c3d4e5","timestamp":"2024-12-03T14:00:03.000Z","message":{"role":"user","content":"Hello","timestamp":1733234403000}}
{"type":"message","id":"d4e5f6g7","parentId":"c3d4e5f6","timestamp":"2024-12-03T14:00:04.000Z","message":{"role":"assistant","content":[{"type":"text","text":"Hi there!"}],"api":"anthropic-messages","provider":"anthropic","model":"claude-sonnet-4-5","usage":{"input":12,"output":8,"cacheRead":0,"cacheWrite":0,"totalTokens":20,"cost":{"input":0.000036,"output":0.00012,"cacheRead":0,"cacheWrite":0,"total":0.000156}},"stopReason":"stop","timestamp":1733234404000}}
```

The tree structure is implicit via `parentId`. The active branch is a sequence of entries where each entry's `id` matches the next entry's `parentId`.

For the authoritative current schema, see `packages/coding-agent/docs/session-format.md` in the pi repo.

### Branching

`/tree` shows all branches in the session. Selecting a point creates a new branch from there. The new branch shares history with the old one (same file, different `parentId` chain). No file duplication.

### Compaction

Compaction summarizes older messages to free up context window:
1. `calculateContextTokens()` estimates token usage
2. `shouldCompact()` checks if usage exceeds threshold
3. `prepareCompaction()` selects messages to summarize
4. `compact()` sends them to the LLM for summarization
5. Summaries replace the original messages in the agent context
6. Full history remains in the JSONL file

Two triggers:
- **Proactive**: When approaching the context limit
- **Reactive**: On context overflow error (recover and retry)

### Extension System

Extensions are TypeScript modules that export a default function receiving an `ExtensionAPI`:

```typescript
export default function (pi: ExtensionAPI) {
  pi.registerTool({ name: "deploy", ... });
  pi.registerCommand("stats", { handler: (args, ctx) => { ... } });
  pi.on("tool_call", async (event, ctx) => { ... });
}
```

The extension API provides:
- **Tools**: Custom tools that appear in the agent's tool registry
- **Commands**: Slash commands (`/command`) that execute immediately
- **Events**: Hooks for agent lifecycle, tool calls, provider requests
- **UI**: Custom components, editor replacement, status lines
- **Session control**: Switch sessions, fork, create new sessions

### Auto-Retry

When the LLM returns a retryable error (rate limit, server error):
1. `agent_end` detects the error
2. `_handleRetryableError()` waits with exponential backoff
3. Retries via `agent.continue()`
4. Emits `auto_retry_start` and `auto_retry_end` events

### System Prompt Construction

The system prompt is built each turn from:
1. Base system prompt (from `.pi/SYSTEM.md` or default)
2. Skills (loaded from skill files)
3. Context files (`AGENTS.md` files from cwd and parents)
4. Tool prompt snippets and guidelines
5. Extension modifications (via `before_agent_start` event)

Extensions can override the system prompt per-turn via the `before_agent_start` event.

## Design Decisions

### Why AgentSession Wraps Agent

`AgentSession` adds product-level concerns on top of the generic `Agent`:
- Session persistence
- Extension integration
- Auto-compaction and retry
- Skill and prompt template expansion
- Bash execution

This keeps `Agent` clean and reusable for non-coding-agent use cases.

### Why SessionManager is Separate from AgentSession

`SessionManager` handles file I/O and JSONL format. `AgentSession` handles agent logic. This separation means:
- `SessionManager` can be used without an agent (for session listing, export)
- The session format can evolve independently of agent logic

### Why Extensions Run with Full System Access

Extensions execute arbitrary code with the same privileges as pi. This is by design: extensions need to be able to do anything the user can do. The trade-off is security: review source code before installing third-party packages.

### Why Compaction is Runtime-Only

Compaction modifies the agent's in-memory context but never mutates the JSONL file. The original messages remain in the file for `/tree` to revisit. This preserves data integrity while solving the context window problem.

## Exercises

### Exercise 1: Session File Format

Create a session JSONL file by hand with a branched conversation. Load it with pi and verify `/tree` shows both branches.

### Exercise 2: Extension with Custom Tool

Write an extension that adds a `count_files` tool. Install it locally and verify the tool appears in the agent's tool registry.

### Exercise 3: Skill Definition

Create a skill that instructs the model to follow a specific code review checklist. Invoke it with `/skill:review` and verify it expands correctly.

### Exercise 4: Auto-Compaction

Create a long conversation that exceeds the context window. Verify that auto-compaction triggers and the agent recovers without losing the conversation thread.

### Exercise 5: Print Mode

Use pi in print mode (`pi -p "List files"`) and trace the event flow from CLI arguments to final stdout output.

## Key Source Files

| File | Purpose |
|------|---------|
| `packages/coding-agent/src/main.ts` | CLI entry point, mode dispatch |
| `packages/coding-agent/src/core/agent-session.ts` | `AgentSession` class |
| `packages/coding-agent/src/core/sdk.ts` | `createAgentSession()` factory |
| `packages/coding-agent/src/core/session-manager.ts` | Session persistence |
| `packages/coding-agent/src/core/extensions/` | Extension system |
| `packages/coding-agent/src/core/compaction/` | Compaction logic |
| `packages/coding-agent/src/core/tools/` | Built-in tools |
| `packages/coding-agent/src/modes/interactive/` | Interactive TUI mode |
