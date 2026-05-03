# Exercise 1: Basic Streaming

Write a script that streams a response from any provider and tracks total tokens and cost.

## Requirements

1. Accept a model provider and model ID as arguments
2. Stream the response to stdout
3. Print total tokens and cost at the end

## Starter Code

```typescript
import { getModel, stream } from "@mariozechner/pi-ai";

async function main() {
  const provider = process.argv[2] || "openai";
  const modelId = process.argv[3] || "gpt-4o-mini";
  const prompt = process.argv[4] || "Hello, world!";

  // TODO: Get model, build context, stream response
}

main().catch(console.error);
```

## Expected Output

```
Hello! How can I help you today?

Total tokens: 25
Cost: $0.00015
```

## Tips

- Use `stream()` not `complete()` so you can see output in real time
- The final message from `await stream.result()` has `usage` and `cost`
- Handle the `error` event type for robustness
