/**
 * Example: Minimal agent loop using only pi-ai.
 *
 * This demonstrates the core agent pattern without using pi-agent-core.
 * It shows what pi-agent-core abstracts away.
 */

import { complete, getModel, stream, type Context, type Tool } from "@mariozechner/pi-ai";
import { Type } from "@mariozechner/pi-ai";
import { readFileSync, writeFileSync } from "node:fs";

// --- 1. Define tools ---

const readTool: Tool = {
  name: "read",
  description: "Read a file's contents",
  parameters: Type.Object({
    path: Type.String({ description: "File path" }),
  }),
};

const bashTool: Tool = {
  name: "bash",
  description: "Execute a shell command",
  parameters: Type.Object({
    command: Type.String({ description: "Shell command" }),
  }),
};

const tools = [readTool, bashTool];

// --- 2. Tool execution ---

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  if (name === "read") {
    return readFileSync(args.path as string, "utf-8");
  }
  if (name === "bash") {
    const { execSync } = await import("node:child_process");
    return execSync(args.command as string, { encoding: "utf-8" });
  }
  throw new Error(`Unknown tool: ${name}`);
}

// --- 3. The agent loop ---

async function runAgent(userMessage: string) {
  const model = getModel("anthropic", "claude-sonnet-4-20250514");

  const context: Context = {
    systemPrompt: "You are a helpful assistant with access to file and shell tools.",
    messages: [{ role: "user", content: userMessage }],
    tools,
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Stream the response
    const response = await complete(model, context);
    context.messages.push(response);

    // Check for tool calls
    const toolCalls = response.content.filter((c) => c.type === "toolCall");
    if (toolCalls.length === 0) {
      console.log("Assistant:", response.content.find((c) => c.type === "text")?.text);
      break;
    }

    // Execute tools and add results
    for (const call of toolCalls) {
      console.log(`Tool: ${call.name}(${JSON.stringify(call.arguments)})`);
      try {
        const result = await executeTool(call.name, call.arguments);
        context.messages.push({
          role: "toolResult",
          toolCallId: call.id,
          toolName: call.name,
          content: [{ type: "text", text: result }],
          isError: false,
          timestamp: Date.now(),
        });
      } catch (error) {
        context.messages.push({
          role: "toolResult",
          toolCallId: call.id,
          toolName: call.name,
          content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
          isError: true,
          timestamp: Date.now(),
        });
      }
    }
  }
}

// --- 4. Run ---

runAgent(process.argv[2] || "List files in the current directory").catch(console.error);
