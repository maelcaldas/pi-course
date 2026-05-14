/**
 * Example: resource-loader overrides plus chained prompt shaping.
 *
 * This example keeps everything deterministic by using the faux provider.
 * It shows:
 *
 * - overriding the base system prompt
 * - appending extra prompt text
 * - injecting synthetic context files
 * - chaining `before_agent_start` handlers from inline extensions
 */

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fauxAssistantMessage, registerFauxProvider } from "@earendil-works/pi-ai";
import {
	AuthStorage,
	createAgentSession,
	DefaultResourceLoader,
	SessionManager,
	type ExtensionFactory,
} from "@earendil-works/pi-coding-agent";

const tempDir = mkdtempSync(join(tmpdir(), "pi-course-loader-"));
const faux = registerFauxProvider();
faux.setResponses([fauxAssistantMessage("Resource loader example complete.")]);

const authStorage = AuthStorage.inMemory();
authStorage.setRuntimeApiKey(faux.getModel().provider, "faux-key");

const extensionFactories: ExtensionFactory[] = [
	(pi) => {
		pi.on("before_agent_start", (event) => ({
			systemPrompt: `${event.systemPrompt}\n\n[Extension A]\n- Add a short checklist before acting.`,
		}));
	},
	(pi) => {
		pi.on("before_agent_start", (event) => ({
			message: {
				customType: "course-example",
				content: "Synthetic context injected by an inline extension",
				display: true,
			},
			systemPrompt: `${event.systemPrompt}\n\n[Extension B]\n- Mention that extra context was injected for this turn.`,
		}));
	},
];

const loader = new DefaultResourceLoader({
	cwd: tempDir,
	agentDir: tempDir,
	noContextFiles: true,
	noSkills: true,
	noPromptTemplates: true,
	noThemes: true,
	systemPromptOverride: () => "You are a precise assistant.",
	appendSystemPromptOverride: (base) => [
		...base,
		"## Additional Loader Rule\n- Prefer short, structured replies.",
	],
	agentsFilesOverride: () => ({
		agentsFiles: [
			{
				path: "/virtual/AGENTS.md",
				content: "# Synthetic Context\n\n- This file exists only to demonstrate loader overrides.",
			},
		],
	}),
	extensionFactories,
});
await loader.reload();

const { session } = await createAgentSession({
	cwd: tempDir,
	agentDir: tempDir,
	model: faux.getModel(),
	authStorage,
	resourceLoader: loader,
	sessionManager: SessionManager.inMemory(tempDir),
});

try {
	await session.bindExtensions({});
	await session.prompt("Say hello.");

	console.log("Base loader system prompt:\n", loader.getSystemPrompt());
	console.log("\nSynthetic context files:", loader.getAgentsFiles().agentsFiles.map((file) => file.path));
	console.log("\nEffective prompt after before_agent_start chaining:\n", session.systemPrompt);
	console.log("\nTranscript roles:", session.messages.map((message) => message.role).join(" -> "));
} finally {
	session.dispose();
	faux.unregister();
	rmSync(tempDir, { recursive: true, force: true });
}
