# Module 02: pi-ai — The Unified LLM API

## What It Is

`@earendil-works/pi-ai` is a unified multi-provider LLM API. It abstracts away provider differences (OpenAI, Anthropic, Google, Groq, etc.) behind a single streaming interface. It handles:

- Streaming text, thinking, and tool calls
- Automatic model discovery and provider configuration
- Token and cost tracking
- Cross-provider context handoffs
- Tool definition with TypeBox schemas

## Core Abstractions

### Model

A `Model` is metadata about an LLM:

```typescript
interface Model<TApi extends string> {
  id: string;              // Provider-specific ID
  name: string;            // Human-readable name
  api: TApi;               // Which API implementation to use
  provider: string;        // Provider name
  baseUrl: string;         // API endpoint
  reasoning: boolean;      // Supports thinking/reasoning
  input: ("text" | "image")[];  // Supported input types
  cost: { input: number; output: number; cacheRead: number; cacheWrite: number };
  contextWindow: number;   // Max context window in tokens
  maxTokens: number;       // Max output tokens
}
```

Key insight: The `api` field determines which provider implementation is used. Multiple providers can share the same API (e.g., Groq, xAI, and Cerebras all use `openai-completions`).

### Context

A `Context` is everything needed for an LLM call:

```typescript
interface Context {
  systemPrompt: string;
  messages: Message[];
  tools?: Tool[];
}
```

Contexts are plain JSON-serializable objects. You can save one to a file, load it later, and continue the conversation with any model from any provider.

### Message

Messages are what LLMs understand:

```typescript
type Message = UserMessage | AssistantMessage | ToolResultMessage;

interface UserMessage {
  role: "user";
  content: string | (TextContent | ImageContent)[];
  timestamp?: number;
}

interface AssistantMessage {
  role: "assistant";
  content: (TextContent | ThinkingContent | ToolCallContent)[];
  usage: Usage;
  stopReason: "stop" | "length" | "toolUse" | "error" | "aborted";
  // ... other fields
}
```

### Streaming Events

`stream()` returns an async iterable of events:

```typescript
for await (const event of stream(model, context)) {
  switch (event.type) {
    case "text_delta": process.stdout.write(event.delta); break;
    case "toolcall_start": console.log("Tool:", event.partial.content[event.contentIndex].name); break;
    case "toolcall_delta": /* partial JSON args */ break;
    case "toolcall_end": console.log("Args:", event.toolCall.arguments); break;
    case "done": console.log("Stop reason:", event.reason); break;
    case "error": console.error("Error:", event.error.errorMessage); break;
  }
}
```

## Deep Dive: Streaming Architecture

### Event Sequence

When you call `stream(model, context)`, the provider implementation:

1. Converts the `Context` to provider-specific format
2. Opens an HTTP connection (SSE or WebSocket)
3. Parses provider-specific streaming chunks
4. Emits normalized events
5. Returns a final `AssistantMessage` via `.result()`

### Partial Tool Arguments

During `toolcall_delta` events, `arguments` contains the best-effort parse of partial JSON. This enables real-time UI updates before the complete arguments are available. Be defensive: fields may be missing or incomplete.

### Cross-Provider Handoffs

The library supports switching models mid-conversation. When messages from one provider are sent to another:
- User and tool result messages pass through unchanged
- Assistant messages from the same provider/API are preserved as-is
- Assistant messages from different providers have their thinking blocks transformed into provider-compatible text content
- Tool calls and regular text are preserved unchanged

Exact transform details evolve, so verify current behavior in `packages/ai/src/providers/transform-messages.ts` and `packages/ai/test/cross-provider-handoff.test.ts`.

This is what enables Ctrl+P model cycling in pi without losing context.

## Exercises

### Exercise 1: Basic Streaming

Write a script that streams a response from any provider. Track the total tokens and cost.

### Exercise 2: Tool Definition and Execution

Define a `get_weather` tool with TypeBox schema. Stream a conversation where the model calls the tool, then handle the result and continue.

### Exercise 3: Cross-Provider Handoff

Start a conversation with Claude, switch to GPT-5 mid-conversation, then switch to Gemini. Verify that tool calls and transformed thinking content remain compatible across providers.

### Exercise 4: Faux Provider for Testing

Use `registerFauxProvider()` to create a deterministic test that simulates a tool call without making real API requests.

## Key Source Files

| File | Purpose |
|------|---------|
| `packages/ai/src/types.ts` | Core types: Model, Context, Message, events |
| `packages/ai/src/stream.ts` | `stream()`, `complete()`, event normalization |
| `packages/ai/src/providers/*.ts` | Provider implementations |
| `packages/ai/src/utils/validation.ts` | Tool argument validation with TypeBox |
| `packages/ai/src/providers/transform-messages.ts` | Cross-provider message transforms |
