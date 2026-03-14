import type { SessionHistoryStorage } from "@german/core/session";

const STORAGE_KEY = "german-app-session-history";

function readStore(): Record<string, string[]> {
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return {};
	try {
		return JSON.parse(raw);
	} catch {
		return {};
	}
}

function writeStore(data: Record<string, string[]>): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const ENCOUNTERED_PREFIX = "german-app-encountered-";

function readEncountered(level: string): string[] {
	const raw = localStorage.getItem(`${ENCOUNTERED_PREFIX}${level}`);
	if (!raw) return [];
	try {
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

export const webHistoryStorage: SessionHistoryStorage = {
	async getExcludedWords(key) {
		return readStore()[key] ?? [];
	},
	async saveSessionWords(key, words) {
		const store = readStore();
		store[key] = words;
		writeStore(store);
	},
	async getEncounteredWords(level) {
		return readEncountered(level);
	},
	async saveEncounteredWords(level, words) {
		localStorage.setItem(`${ENCOUNTERED_PREFIX}${level}`, JSON.stringify(words));
	},
	async resetEncounteredWords(level) {
		localStorage.removeItem(`${ENCOUNTERED_PREFIX}${level}`);
	},
};
