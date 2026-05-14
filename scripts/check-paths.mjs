#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const courseDir = path.resolve(__dirname, "..");
const repoDir = path.resolve(courseDir, "../pi");

if (!existsSync(repoDir)) {
	console.error(`Missing expected repo at ${repoDir}`);
	process.exit(1);
}

const allowedExtensions = new Set([".md", ".ts", ".jsonl"]);
const ignoredDirs = new Set([".git", "node_modules"]);
const pathPattern = /packages\/[A-Za-z0-9_.\/-]+/g;
const trailingJunkPattern = /[),.;:`"'\]]+$/;

function walk(dir) {
	const entries = readdirSync(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		if (ignoredDirs.has(entry.name)) continue;
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walk(fullPath));
			continue;
		}
		if (allowedExtensions.has(path.extname(entry.name))) {
			files.push(fullPath);
		}
	}
	return files;
}

const missing = [];

for (const filePath of walk(courseDir)) {
	const text = readFileSync(filePath, "utf8");
	const refs = new Set(text.match(pathPattern) ?? []);
	for (const rawRef of refs) {
		const ref = rawRef.replace(trailingJunkPattern, "");
		const target = path.join(repoDir, ref);
		if (!existsSync(target)) {
			missing.push({
				file: path.relative(courseDir, filePath),
				ref,
			});
		}
	}
}

if (missing.length > 0) {
	console.error("Found broken ../pi path references:\n");
	for (const item of missing) {
		console.error(`- ${item.file}: ${item.ref}`);
	}
	process.exit(1);
}

console.log("All ../pi path references resolve.");
