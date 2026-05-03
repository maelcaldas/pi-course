/**
 * Example: Extending AgentMessage with custom types.
 *
 * This shows how to add UI-only messages that never reach the LLM.
 */

import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";

// --- 1. Extend AgentMessage via declaration merging ---

declare module "@mariozechner/pi-agent-core" {
  interface CustomAgentMessages {
    notification: {
      role: "notification";
      text: string;
      timestamp: number;
    };
    status: {
      role: "status";
      operation: string;
      progress: number;
      timestamp: number;
    };
  }
}

// --- 2. Create agent with custom convertToLlm ---

const agent = new Agent({
  initialState: {
    systemPrompt: "You are helpful.",
    model: getModel("openai", "gpt-4o-mini"),
  },
  convertToLlm: (messages) =>
    messages.flatMap((m) => {
      if (m.role === "notification") {
        // Filter out notifications — the LLM never sees them
        return [];
      }
      if (m.role === "status") {
        // Convert status to a user message for the LLM
        return [
          {
            role: "user" as const,
            content: `Status update: ${m.operation} is ${m.progress}% complete`,
            timestamp: m.timestamp,
          },
        ];
      }
      // Pass through standard LLM messages
      return [m];
    }),
});

// --- 3. Subscribe to events ---

agent.subscribe((event) => {
  if (event.type === "message_start") {
    console.log("Message start:", event.message.role);
  }
  if (event.type === "message_end") {
    console.log("Message end:", event.message.role);
  }
});

// --- 4. Use custom messages ---

async function main() {
  // Add a notification to the transcript
  agent.state.messages.push({
    role: "notification",
    text: "System initialized",
    timestamp: Date.now(),
  });

  // Add a status update
  agent.state.messages.push({
    role: "status",
    operation: "Indexing files",
    progress: 50,
    timestamp: Date.now(),
  });

  // Now prompt — the notification is filtered, status is converted
  await agent.prompt("What is my current status?");

  // Inspect the transcript
  console.log("\n--- Transcript ---");
  for (const msg of agent.state.messages) {
    console.log(msg.role, ":", "content" in msg ? msg.content : "(custom)");
  }
}

main().catch(console.error);
