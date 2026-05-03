/**
 * Example: Streaming with tool calls using pi-ai.
 *
 * This shows how to handle streaming events including partial tool arguments.
 */

import { getModel, stream, validateToolCall, type Context, type Tool } from "@mariozechner/pi-ai";
import { Type } from "@mariozechner/pi-ai";

const calculatorTool: Tool = {
  name: "calculate",
  description: "Perform a calculation",
  parameters: Type.Object({
    expression: Type.String({ description: "Math expression to evaluate" }),
  }),
};

async function main() {
  const model = getModel("openai", "gpt-4o-mini");
  const context: Context = {
    systemPrompt: "You are a calculator assistant. Use the calculate tool for math.",
    messages: [{ role: "user", content: "What is 1234 * 5678?" }],
    tools: [calculatorTool],
  };

  const s = stream(model, context);

  for await (const event of s) {
    switch (event.type) {
      case "text_start":
        process.stdout.write("[Text started] ");
        break;
      case "text_delta":
        process.stdout.write(event.delta);
        break;
      case "text_end":
        process.stdout.write(" [Text ended]\n");
        break;
      case "toolcall_start":
        console.log("[Tool call started]");
        break;
      case "toolcall_delta": {
        // Partial tool arguments during streaming
        const partialCall = event.partial.content[event.contentIndex];
        if (partialCall?.type === "toolCall" && partialCall.arguments?.expression) {
          console.log(`  Streaming expression: ${partialCall.arguments.expression}`);
        }
        break;
      }
      case "toolcall_end": {
        console.log(`[Tool call ended] ${event.toolCall.name}`);
        // Validate arguments before executing
        try {
          const validated = validateToolCall([calculatorTool], event.toolCall);
          console.log("  Validated args:", validated);
          // Execute the tool...
        } catch (error) {
          console.error("  Validation failed:", error);
        }
        break;
      }
      case "done":
        console.log("\n[Done] Reason:", event.reason);
        break;
      case "error":
        console.error("\n[Error]", event.error.errorMessage);
        break;
    }
  }

  const final = await s.result();
  console.log("\nTotal tokens:", final.usage.totalTokens);
  console.log("Cost: $", final.usage.cost.total.toFixed(4));
}

main().catch(console.error);
