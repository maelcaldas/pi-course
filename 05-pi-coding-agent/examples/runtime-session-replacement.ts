/**
 * Example: runtime-backed session replacement.
 *
 * This is the smallest concrete example of the pattern described in
 * `01-runtime-and-services.md`:
 *
 * - create one runtime factory
 * - let the runtime replace the active AgentSession
 * - rebind host-owned session state after replacement
 * - do post-replacement work inside `withSession()`
 */

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fauxAssistantMessage, registerFauxProvider } from "@earendil-works/pi-ai";
import {
	AuthStorage,
	type CreateAgentSessionRuntimeFactory,
	createAgentSessionFromServices,
	createAgentSessionRuntime,
	createAgentSessionServices,
	SessionManager,
} from "@earendil-works/pi-coding-agent";

const tempDir = mkdtempSync(join(tmpdir(), "pi-course-runtime-"));
const sessionDir = join(tempDir, "sessions");
const faux = registerFauxProvider();
faux.setResponses([
	fauxAssistantMessage("You are in the original session."),
	fauxAssistantMessage("You are in the replacement session."),
	fauxAssistantMessage("You switched back to the original session."),
]);

const authStorage = AuthStorage.inMemory();
authStorage.setRuntimeApiKey(faux.getModel().provider, "faux-key");

const createRuntime: CreateAgentSessionRuntimeFactory = async ({ cwd, sessionManager, sessionStartEvent }) => {
	const services = await createAgentSessionServices({
		cwd,
		agentDir: tempDir,
		authStorage,
		resourceLoaderOptions: {
			noSkills: true,
			noPromptTemplates: true,
			noThemes: true,
			noContextFiles: true,
		},
	});

	return {
		...(await createAgentSessionFromServices({
			services,
			sessionManager,
			sessionStartEvent,
			model: faux.getModel(),
		})),
		services,
		diagnostics: services.diagnostics,
	};
};

const runtime = await createAgentSessionRuntime(createRuntime, {
	cwd: tempDir,
	agentDir: tempDir,
	sessionManager: SessionManager.create(tempDir, sessionDir),
});

let unsubscribe: (() => void) | undefined;

async function bindSession(session = runtime.session) {
	unsubscribe?.();
	await session.bindExtensions({});
	unsubscribe = session.subscribe((event) => {
		if (event.type === "queue_update") {
			console.log("Queued messages:", event.steering.length + event.followUp.length);
		}
	});
}

runtime.setRebindSession(async (session) => {
	await bindSession(session);
	console.log("Rebound host state to:", session.sessionFile ?? "in-memory-session");
});

try {
	await bindSession();

	await runtime.session.prompt("Say which session this is.");
	const originalSessionFile = runtime.session.sessionFile;
	console.log("Original session file:", originalSessionFile);

	await runtime.newSession({
		withSession: async (ctx) => {
			// Safe pattern: use the replacement-session ctx passed here.
			await ctx.sendUserMessage("Say which session this is after replacement.");
		},
	});
	console.log("Replacement session file:", runtime.session.sessionFile);

	if (originalSessionFile) {
		await runtime.switchSession(originalSessionFile);
		await runtime.session.prompt("Say which session this is after switching back.");
		console.log("Switched back to:", runtime.session.sessionFile);
	}
} finally {
	unsubscribe?.();
	await runtime.dispose();
	faux.unregister();
	rmSync(tempDir, { recursive: true, force: true });
}
