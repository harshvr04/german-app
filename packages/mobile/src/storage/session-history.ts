import type { SessionHistoryStorage } from "@german/core/session";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "german-app-session-history";

async function readStore(): Promise<Record<string, string[]>> {
	const raw = await AsyncStorage.getItem(STORAGE_KEY);
	if (!raw) return {};
	try {
		return JSON.parse(raw);
	} catch {
		return {};
	}
}

async function writeStore(data: Record<string, string[]>): Promise<void> {
	await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const ENCOUNTERED_PREFIX = "german-app-encountered-";

async function readEncountered(level: string): Promise<string[]> {
	const raw = await AsyncStorage.getItem(`${ENCOUNTERED_PREFIX}${level}`);
	if (!raw) return [];
	try {
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

export const mobileHistoryStorage: SessionHistoryStorage = {
	async getExcludedWords(key) {
		const store = await readStore();
		return store[key] ?? [];
	},
	async saveSessionWords(key, words) {
		const store = await readStore();
		store[key] = words;
		await writeStore(store);
	},
	async getEncounteredWords(level) {
		return readEncountered(level);
	},
	async saveEncounteredWords(level, words) {
		await AsyncStorage.setItem(`${ENCOUNTERED_PREFIX}${level}`, JSON.stringify(words));
	},
	async resetEncounteredWords(level) {
		await AsyncStorage.removeItem(`${ENCOUNTERED_PREFIX}${level}`);
	},
};
