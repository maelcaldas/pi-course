# Module 06: Capstone — Build Your Own Pi

## Goal

Implement a minimal but complete coding agent from scratch. It will not have all of pi's features, but it will have the core architecture: LLM streaming, tool execution, event-driven UI, and session persistence.

## What You Will Build

A CLI tool called `mini-pi` with these features:
1. **LLM streaming** via pi-ai
2. **Agent loop** with tool execution
3. **Built-in tools**: `read`, `bash`, `edit`, `write`
4. **Simple TUI** with an editor and message display
5. **Session persistence** as JSONL
6. **Print mode** for non-interactive use

## Architecture

```
mini-pi
├── src/
│   ├── llm.ts          # Wrapper around pi-ai
│   ├── agent.ts        # Agent loop (simplified pi-agent-core)
│   ├── tools.ts        # Tool definitions and execution
│   ├── tui.ts          # Minimal terminal UI
│   ├── session.ts      # JSONL session persistence
│   └── main.ts         # CLI entry point
├── package.json
└── tsconfig.json
```

## Step-by-Step Guide

### Step 1: Project Setup

Create a new TypeScript project:

```bash
mkdir mini-pi && cd mini-pi
npm init -y
npm install typescript @types/node @mariozechner/pi-ai @mariozechner/pi-agent-core @mariozechner/pi-tui
npx tsc --init
```

### Step 2: LLM Wrapper (`src/llm.ts`)

Create a thin wrapper around pi-ai that handles model selection and API key resolution.

### Step 3: Tool Definitions (`src/tools.ts`)

Implement the four core tools:
- `read`: Read a file's contents
- `write`: Write contents to a file
- `edit`: Apply a diff to a file
- `bash`: Execute a shell command

Use TypeBox for parameter schemas.

### Step 4: Agent Loop (`src/agent.ts`)

Implement a simplified agent loop:
1. Accept a user message
2. Stream LLM response
3. Detect tool calls
4. Execute tools
5. Send results back to LLM
6. Repeat until no more tool calls

Emit events: `message_start`, `message_update`, `message_end`, `tool_execution_start`, `tool_execution_end`.

### Step 5: Session Persistence (`src/session.ts`)

Implement JSONL session storage:
- Append messages to a file
- Load previous messages on startup
- Simple format: one JSON object per line

### Step 6: Minimal TUI (`src/tui.ts`)

Build a simple terminal UI:
- Display previous messages
- Editor at the bottom for user input
- Handle Enter to submit, Ctrl+C to quit
- Show tool execution status

Use pi-tui's `TUI` and `Component` interfaces.

### Step 7: CLI Entry Point (`src/main.ts`)

Parse CLI arguments:
- `--model`: Model to use
- `--continue`: Continue previous session
- `--print`: Print mode (non-interactive)
- `--session-dir`: Custom session directory

Dispatch to interactive or print mode.

### Step 8: Integration Test

Test the full flow:
1. Run `mini-pi`
2. Ask it to create a file
3. Verify the file was created
4. Ask it to read the file
5. Verify the content is correct
6. Quit and re-run with `--continue`
7. Verify the conversation resumed

## Extension Ideas

Once the core works, add these features:
- **Steering queue**: Allow typing while the agent is working
- **Parallel tool execution**: Run multiple tools concurrently
- **Compaction**: Summarize old messages when context fills up
- **Extensions**: Load custom tools from files
- **Skills**: Support `/skill:name` commands
- **Branching**: Support session tree navigation

## Evaluation Criteria

Your implementation should demonstrate understanding of:
- [ ] Separation of concerns (LLM, agent, UI, persistence)
- [ ] Event-driven architecture
- [ ] Streaming and partial updates
- [ ] Tool lifecycle (validation, execution, error handling)
- [ ] Session persistence format
- [ ] Why each design decision was made

## Reference Implementation

Study the actual pi source code as you build:
- `packages/agent/src/agent-loop.ts` for the loop structure
- `packages/coding-agent/src/core/tools/` for tool implementations
- `packages/tui/src/components/editor.ts` for the editor
- `packages/coding-agent/src/core/session-manager.ts` for persistence

## Final Notes

This capstone is intentionally open-ended. The goal is not to replicate pi exactly, but to understand its architecture deeply enough to build something similar. Focus on getting the core loop right first. Everything else is an extension of that foundation.
