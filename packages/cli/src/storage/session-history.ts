import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { SessionHistoryStorage } from "@german/core/session";

const DIR = join(homedir(), ".german-app");
const FILE = join(DIR, "history.json");

function readStore(): Record<string, string[]> {
	if (!existsSync(FILE)) return {};
	try {
		return JSON.parse(readFileSync(FILE, "utf-8"));
	} catch {
		return {};
	}
}

function writeStore(data: Record<string, string[]>): void {
	if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
	writeFileSync(FILE, JSON.stringify(data));
}

export const cliHistoryStorage: SessionHistoryStorage = {
	async getExcludedWords(key) {
		return readStore()[key] ?? [];
	},
	async saveSessionWords(key, words) {
		const store = readStore();
		store[key] = words;
		writeStore(store);
	},
	async getEncounteredWords(level) {
		const key = `encountered-${level}`;
		return readStore()[key] ?? [];
	},
	async saveEncounteredWords(level, words) {
		const key = `encountered-${level}`;
		const store = readStore();
		store[key] = words;
		writeStore(store);
	},
	async resetEncounteredWords(level) {
		const key = `encountered-${level}`;
		const store = readStore();
		delete store[key];
		writeStore(store);
	},
};
