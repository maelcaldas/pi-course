# Exercise 2: Parallel Tool Execution

Create two tools with different execution speeds and verify parallel behavior.

## Requirements

1. Create `fast_tool` that resolves immediately
2. Create `slow_tool` that waits 2 seconds
3. Have the model call both in the same assistant message
4. Verify execution order vs. result order

## Expected Behavior

```
Tool execution start: fast_tool
Tool execution end: fast_tool        <-- Emitted first
Tool execution start: slow_tool
Tool execution end: slow_tool        <-- Emitted 2 seconds later

Tool result messages in transcript:  <-- In assistant source order
  1. fast_tool result
  2. slow_tool result
```

## Using pi-agent-core

Use the `Agent` class with `toolExecution: "parallel"` (the default). Subscribe to `tool_execution_start` and `tool_execution_end` events to observe the order.

## Bonus

Try with `toolExecution: "sequential"` and observe the difference.
