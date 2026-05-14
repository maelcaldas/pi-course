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
const repoRefPattern = /\.\.\/pi\/[A-Za-z0-9_.\/-]+/g;
const markdownLinkPattern = /!?\[[^\]]*]\(([^)]+)\)/g;
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

function resolveCourseLink(filePath, target) {
	if (target.startsWith("../pi/")) {
		return path.resolve(courseDir, target);
	}
	return path.resolve(path.dirname(filePath), target);
}

function normalizeLinkTarget(rawTarget) {
	const trimmed = rawTarget.trim();
	const unwrapped = trimmed.startsWith("<") && trimmed.endsWith(">") ? trimmed.slice(1, -1) : trimmed;
	const withoutTitle = unwrapped.split(/\s+/, 1)[0] ?? "";
	return withoutTitle;
}

function shouldIgnoreLink(target) {
	return (
		target === "" ||
		target.startsWith("#") ||
		target.startsWith("http://") ||
		target.startsWith("https://") ||
		target.startsWith("mailto:")
	);
}

const errors = [];

for (const filePath of walk(courseDir)) {
	const text = readFileSync(filePath, "utf8");
	const relativeFile = path.relative(courseDir, filePath);

	const repoRefs = new Set(text.match(repoRefPattern) ?? []);
	for (const rawRef of repoRefs) {
		const ref = rawRef.replace(trailingJunkPattern, "");
		const relativeRepoPath = ref.replace(/^\.\.\/pi\//, "");
		const target = path.join(repoDir, relativeRepoPath);
		if (!existsSync(target)) {
			errors.push({
				kind: "repo-ref",
				file: relativeFile,
				reference: ref,
			});
		}
	}

	if (path.extname(filePath) !== ".md") {
		continue;
	}

	for (const match of text.matchAll(markdownLinkPattern)) {
		const target = normalizeLinkTarget(match[1] ?? "");
		if (shouldIgnoreLink(target)) {
			continue;
		}
		const withoutAnchor = target.split("#", 1)[0] ?? "";
		if (withoutAnchor === "") {
			continue;
		}
		const resolved = resolveCourseLink(filePath, withoutAnchor);
		if (!existsSync(resolved)) {
			errors.push({
				kind: "markdown-link",
				file: relativeFile,
				reference: target,
			});
		}
	}
}

if (errors.length > 0) {
	console.error("Found broken references:\n");
	for (const error of errors) {
		console.error(`- [${error.kind}] ${error.file}: ${error.reference}`);
	}
	process.exit(1);
}

console.log("All repo references and local markdown links resolve.");
