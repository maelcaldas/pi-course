/**
 * Example: Minimal agent loop using only pi-ai.
 *
 * This demonstrates the core agent pattern without using pi-agent-core.
 * It shows what pi-agent-core abstracts away.
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { complete, getModel, Type, type Context, type Tool } from "@earendil-works/pi-ai";

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

function requireString(value: unknown, name: string): string {
  if (typeof value !== "string") {
    throw new Error(`${name} must be a string`);
  }
  return value;
}

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  if (name === "read") {
    const path = requireString(args.path, "path");
    return readFileSync(path, "utf-8");
  }
  if (name === "bash") {
    const command = requireString(args.command, "command");
    return execSync(command, { encoding: "utf-8" });
  }
  throw new Error(`Unknown tool: ${name}`);
}

// --- 3. The agent loop ---

async function runAgent(userMessage: string) {
  const model = getModel("anthropic", "claude-sonnet-4-20250514");

  const context: Context = {
    systemPrompt: "You are a helpful assistant with access to file and shell tools.",
    messages: [{ role: "user", content: userMessage, timestamp: Date.now() }],
    tools,
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const response = await complete(model, context);
    context.messages.push(response);

    const toolCalls = response.content.filter((content) => content.type === "toolCall");
    if (toolCalls.length === 0) {
      console.log("Assistant:", response.content.find((content) => content.type === "text")?.text);
      break;
    }

    for (const toolCall of toolCalls) {
      console.log(`Tool: ${toolCall.name}(${JSON.stringify(toolCall.arguments)})`);
      try {
        const result = await executeTool(toolCall.name, toolCall.arguments);
        context.messages.push({
          role: "toolResult",
          toolCallId: toolCall.id,
          toolName: toolCall.name,
          content: [{ type: "text", text: result }],
          isError: false,
          timestamp: Date.now(),
        });
      } catch (error) {
        context.messages.push({
          role: "toolResult",
          toolCallId: toolCall.id,
          toolName: toolCall.name,
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
