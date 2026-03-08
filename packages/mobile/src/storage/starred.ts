import type { StarredWord, StarredWordsStorage } from "@german/core/session";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STARRED_KEY = "german-app-starred";

async function readStarred(): Promise<StarredWord[]> {
	const raw = await AsyncStorage.getItem(STARRED_KEY);
	if (!raw) return [];
	try {
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

async function writeStarred(data: StarredWord[]): Promise<void> {
	await AsyncStorage.setItem(STARRED_KEY, JSON.stringify(data));
}

export const mobileStarredStorage: StarredWordsStorage = {
	async getStarredWords() {
		return readStarred();
	},
	async addStarredWord(word, level) {
		const starred = await readStarred();
		if (!starred.some((s) => s.word === word && s.level === level)) {
			starred.push({ word, level });
			await writeStarred(starred);
		}
	},
	async removeStarredWord(word, level) {
		const starred = await readStarred();
		await writeStarred(starred.filter((s) => !(s.word === word && s.level === level)));
	},
};
