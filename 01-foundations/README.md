# Module 01: Foundations

## What Pi Is

Pi is a minimal terminal coding harness built as a layered stack. It is aggressively extensible so it does not have to dictate your workflow. Features that other tools bake in (sub-agents, plan mode, permission popups, MCP) are built with extensions, skills, or prompt templates instead.

## The Five Layers

```
+----------------------------------------------------------+
|  pi-coding-agent  |  Interactive CLI, sessions, themes,  |
|                   |  extensions, skills, compaction        |
+-------------------+----------------------------------------+
|  pi-tui           |  Terminal UI with differential         |
|                   |  rendering, overlays, components       |
+-------------------+----------------------------------------+
|  pi-agent-core    |  Agent loop, state, events,            |
|                   |  tool execution (parallel/sequential)  |
+-------------------+----------------------------------------+
|  pi-ai            |  Unified multi-provider LLM API:       |
|                   |  streaming, tools, thinking, images    |
+-------------------+----------------------------------------+
|  LLM Providers    |  Anthropic, OpenAI, Google, Groq,      |
|                   |  xAI, local models, etc.               |
+----------------------------------------------------------+
```

## Key Design Decisions

### 1. Separation of Concerns

Each layer has a single responsibility:
- **pi-ai** knows about LLMs and nothing else. It does not know about agents, tools, or terminals.
- **pi-agent-core** knows about the agent loop and tool execution but knows nothing about terminals or session files.
- **pi-tui** knows about rendering to a terminal but knows nothing about LLMs.
- **pi-coding-agent** glues everything together and adds product-level concerns: sessions, extensions, skills, compaction.

This means you can use pi-ai in a web app, pi-agent-core in a headless server, and pi-tui in a completely different CLI tool.

### 2. Event-Driven Architecture

The agent loop emits events. The UI subscribes to them. There is no direct coupling between the LLM streaming and the terminal display.

```
User types → AgentSession.prompt() → Agent.prompt()
                                    ↓
                              Agent Loop runs
                                    ↓
                    Events: agent_start, turn_start,
                    message_start, message_update,
                    message_end, tool_execution_start,
                    tool_execution_end, turn_end, agent_end
                                    ↓
                         UI subscribers update display
```

This decoupling is critical. It means:
- The same agent can drive an interactive TUI, a print-mode CLI, or an RPC server
- Events can be logged, intercepted, or transformed by extensions
- The UI can be replaced entirely without touching the agent logic

### 3. AgentMessage vs LLM Message

The agent uses `AgentMessage`, a superset of LLM messages. This allows:
- Custom message types (notifications, UI artifacts) that the LLM never sees
- A clean separation between the conversation transcript and what gets sent to the model
- `convertToLlm` bridges the gap by filtering and transforming before each LLM call

### 4. Streaming Everything

Everything streams. Text streams in chunks. Tool arguments stream as partial JSON. Thinking blocks stream. Tool execution can stream progress updates. This enables responsive UIs where the user sees output as it is produced, not after a long wait.

### 5. Parallel Tool Execution

Tool calls from a single assistant message execute in parallel by default. They are prepared sequentially (for validation and hooks), then executed concurrently. Results are emitted in completion order but persisted in assistant source order.

### 6. Steering and Follow-up Queues

While the agent is working, the user can queue messages:
- **Steering**: Delivered after the current turn's tool calls finish, before the next LLM call. Use this to interrupt or redirect.
- **Follow-up**: Delivered only after the agent would otherwise stop. Use this for additional tasks.

This is the mechanism that makes interactive mode feel responsive. The user never has to wait for the agent to completely finish before sending the next instruction.

### 7. Session as JSONL Tree

Sessions are stored as JSONL files with a tree structure. Each entry has an `id` and `parentId`, enabling in-place branching without creating new files. This is how `/tree`, `/fork`, and `/clone` work.

### 8. Compaction as Lossy Summarization

When context windows fill up, pi compacts older messages into a summary. This is intentionally lossy. The full history remains in the JSONL file; use `/tree` to revisit. Compaction is a runtime transform, not a data mutation.

### 9. Extensibility Over Built-ins

Pi intentionally skips features other tools bake in:
- **No sub-agents**: Build with extensions or spawn pi instances via tmux
- **No plan mode**: Write plans to files or build with extensions
- **No MCP**: Build CLI tools with READMEs (skills) or add MCP via extensions
- **No permission popups**: Run in a container or build your own confirmation flow
- **No built-in to-dos**: They confuse models; use a TODO.md file

The philosophy: adapt pi to your workflows, not the other way around.

## Key Boundaries

| Boundary | What Crosses It | What Does Not |
|----------|----------------|---------------|
| pi-ai → pi-agent-core | `streamSimple()`, `complete()`, `Context`, `Message` | Terminal state, session files |
| pi-agent-core → pi-coding-agent | `Agent`, `AgentEvent`, `AgentMessage` | Model registry, auth, settings |
| pi-tui → pi-coding-agent | `TUI`, `Component`, `OverlayHandle` | Agent loop, LLM calls |
| Extensions → pi-coding-agent | Tools, commands, events, UI | Direct agent loop access |

## Concepts Checklist

Before moving to the next module, ensure you can explain:
- [ ] Why pi-ai knows nothing about agents
- [ ] The difference between `AgentMessage` and `Message`
- [ ] What events the agent loop emits and in what order
- [ ] How steering and follow-up queues enable interactive mode
- [ ] Why parallel tool execution matters
- [ ] How sessions support branching without file duplication
- [ ] Why compaction is lossy and where the original data lives
