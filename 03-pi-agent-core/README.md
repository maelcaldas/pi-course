# Module 03: pi-agent-core — The Agent Loop

## What It Is

`@earendil-works/pi-agent-core` is the heart of the pi agent. It manages the conversation loop: send prompts to the LLM, handle tool calls, emit events, and maintain state. It knows nothing about terminals, sessions, or extensions. It is pure agent logic.

## Core Abstractions

### Agent

The `Agent` class is a stateful wrapper around the low-level agent loop. It owns:

- The conversation transcript (`state.messages`)
- The tool registry (`state.tools`)
- The current model and thinking level
- Steering and follow-up queues
- Event subscribers

```typescript
const agent = new Agent({
    initialState: {
        systemPrompt: 'You are a helpful assistant.',
        model: getModel('anthropic', 'claude-sonnet-4-20250514'),
        tools: [readTool, bashTool],
    },
});

agent.subscribe((event, signal) => {
    console.log(event.type);
});

await agent.prompt('Hello!');
```

### Agent Loop

The low-level `agentLoop` and `runAgentLoop` functions implement the core logic. Understanding the loop is essential to understanding pi.

## Deep Dive: The Agent Loop

### The Outer and Inner Loops

```
while (true) {                          // Outer loop: follow-up messages
  while (hasMoreToolCalls || pendingMessages.length > 0) {
    // Inner loop: one turn = LLM call + tool execution

    // 1. Inject pending steering messages
    for (const message of pendingMessages) {
      emit message_start/message_end
      add to context
    }

    // 2. Stream assistant response
    const message = await streamAssistantResponse(context, config, signal, emit);

    // 3. Check for errors/aborts
    if (message.stopReason === "error" || message.stopReason === "aborted") {
      emit turn_end, agent_end
      return
    }

    // 4. Execute tool calls
    const toolCalls = message.content.filter(c => c.type === "toolCall");
    if (toolCalls.length > 0) {
      const results = await executeToolCalls(context, message, config, signal, emit);
      add results to context
      hasMoreToolCalls = !results.terminate;
    }

    // 5. Emit turn_end
    emit turn_end

    // 6. Check shouldStopAfterTurn
    if (config.shouldStopAfterTurn?.(...)) {
      emit agent_end
      return
    }

    // 7. Check for steering messages
    pendingMessages = await config.getSteeringMessages?.() || [];
  }

  // 8. Check for follow-up messages
  const followUpMessages = await config.getFollowUpMessages?.() || [];
  if (followUpMessages.length > 0) {
    pendingMessages = followUpMessages;
    continue; // Back to inner loop
  }

  break; // No more messages, exit
}

emit agent_end;
```

### Event Sequence for a Simple Prompt

```
prompt("Hello")
├─ agent_start
├─ turn_start
├─ message_start   { message: userMessage }
├─ message_end     { message: userMessage }
├─ message_start   { message: assistantMessage }
├─ message_update  { message: partial... }
├─ message_update  { message: partial... }
├─ message_end     { message: assistantMessage }
├─ turn_end        { message, toolResults: [] }
└─ agent_end       { messages: [...] }
```

### Event Sequence with Tool Calls

```
prompt("Read config.json")
├─ agent_start
├─ turn_start
├─ message_start/end  { userMessage }
├─ message_start      { assistantMessage with toolCall }
├─ message_update...  { streaming tool args }
├─ message_end        { assistantMessage }
├─ tool_execution_start   { toolCallId, toolName, args }
├─ tool_execution_update  { partialResult }  // If tool streams
├─ tool_execution_end     { toolCallId, result }
├─ message_start/end  { toolResultMessage }
├─ turn_end           { message, toolResults: [toolResult] }
│
├─ turn_start         // Next turn
├─ message_start      { assistantMessage }
├─ message_update...
├─ message_end
├─ turn_end
└─ agent_end
```

### Parallel vs Sequential Tool Execution

**Parallel** (default):

1. Preflight all tool calls sequentially (validation, hooks)
2. Execute allowed tools concurrently
3. Emit `tool_execution_end` in completion order
4. Emit toolResult messages in assistant source order

**Sequential**:

1. Execute tool calls one by one
2. Each waits for the previous to complete

A single tool with `executionMode: "sequential"` forces the entire batch to run sequentially.

### Tool Call Lifecycle

```
1. prepareToolCall
   ├── Find tool by name
   ├── prepareArguments (optional shim)
   ├── validateToolArguments (TypeBox schema validation)
   ├── beforeToolCall hook (can block)
   └── Returns: PreparedToolCall or ImmediateToolCallOutcome

2. executePreparedToolCall
   ├── Call tool.execute(toolCallId, params, signal, onUpdate)
   ├── onUpdate streams partial results
   └── Returns: ExecutedToolCallOutcome

3. finalizeExecutedToolCall
   ├── afterToolCall hook (can override result)
   └── Returns: FinalizedToolCallOutcome

4. emitToolExecutionEnd
5. createToolResultMessage
6. emitToolResultMessage
```

### The Agent Class as a Barrier

The `Agent` class treats `message_end` processing as a barrier before tool preflight begins. This means:

- `beforeToolCall` sees agent state that already includes the assistant message
- Event listeners for `message_end` complete before any tool starts executing
- This is critical for extensions that need to inspect or modify the assistant message before tools run

The low-level `agentLoop()` stream does **not** provide this barrier. Events are emitted as they happen, but the stream does not wait for your async handling before continuing.

### Custom Message Types

Apps can extend `AgentMessage` via declaration merging:

```typescript
declare module '@earendil-works/pi-agent-core' {
    interface CustomAgentMessages {
        notification: { role: 'notification'; text: string; timestamp: number };
    }
}
```

Custom types must be handled in `convertToLlm` to filter them out or transform them before sending to the LLM.

## Design Decisions

### Why AgentMessage is a Superset of Message

This allows the agent to carry UI-only messages (notifications, status updates) in the transcript without sending them to the LLM. The `convertToLlm` function is the gatekeeper.

### Why the Loop is Split into Outer and Inner

- **Inner loop**: Handles a single turn (LLM call + tool execution) plus any steering messages that arrive during it.
- **Outer loop**: Handles follow-up messages that should only run after the agent would otherwise stop.

This separation is what makes steering and follow-up semantics correct.

### Why toolExecutionEnd Emits in Completion Order but toolResults in Source Order

In parallel mode, tools finish at different times. Emitting `tool_execution_end` in completion order gives the UI real-time feedback. But persisting toolResult messages in assistant source order ensures the LLM sees a deterministic transcript.

### Why Terminate is a Hint, Not a Command

Tools can return `terminate: true` to hint that the agent should stop. But this only takes effect when **every** finalized tool result in the batch sets it. This prevents partial termination when multiple tools are running.

## Exercises

### Exercise 1: Minimal Agent Loop

Implement a minimal agent loop using only `pi-ai` (no `pi-agent-core`). Create a loop that:

1. Sends a user message to the LLM
2. Handles any tool calls by executing them
3. Sends tool results back to the LLM
4. Repeats until no more tool calls

### Exercise 2: Custom Message Types

Extend `AgentMessage` with a custom `notification` type. Create an agent that:

1. Emits a notification before each tool call
2. Filters notifications out in `convertToLlm`
3. Verifies notifications appear in the transcript but never reach the LLM

### Exercise 3: Parallel Tool Execution

Create two tools: `fast_tool` (resolves immediately) and `slow_tool` (waits 2 seconds). Have the model call both in the same message. Verify that:

1. `tool_execution_end` for `fast_tool` emits before `slow_tool`
2. Both toolResult messages appear in source order

### Exercise 4: beforeToolCall and afterToolCall Hooks

Implement a permission gate using `beforeToolCall` that blocks `bash` tool calls unless a global flag is set. Use `afterToolCall` to log all tool executions to a file.

### Exercise 5: Steering Queue

While the agent is executing a long-running tool, queue a steering message. Verify that:

1. The steering message is delivered after the tool finishes
2. The agent responds to the steering message before any follow-up messages

## Key Source Files

| File                               | Purpose                                                 |
| ---------------------------------- | ------------------------------------------------------- |
| `packages/agent/src/agent.ts`      | The `Agent` class: state, queues, subscribers           |
| `packages/agent/src/agent-loop.ts` | `agentLoop`, `runAgentLoop`, tool execution             |
| `packages/agent/src/types.ts`      | `AgentMessage`, `AgentTool`, `AgentEvent`, `AgentState` |
| `packages/agent/src/proxy.ts`      | `streamProxy` for backend proxies                       |
