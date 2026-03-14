import type { StarredWord, StarredWordsStorage } from "@german/core/session";

const STARRED_KEY = "german-app-starred";

function readStarred(): StarredWord[] {
	const raw = localStorage.getItem(STARRED_KEY);
	if (!raw) return [];
	try {
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

function writeStarred(data: StarredWord[]): void {
	localStorage.setItem(STARRED_KEY, JSON.stringify(data));
}

export const webStarredStorage: StarredWordsStorage = {
	async getStarredWords() {
		return readStarred();
	},
	async addStarredWord(word, level) {
		const starred = readStarred();
		if (!starred.some((s) => s.word === word && s.level === level)) {
			starred.push({ word, level });
			writeStarred(starred);
		}
	},
	async removeStarredWord(word, level) {
		const starred = readStarred();
		writeStarred(starred.filter((s) => !(s.word === word && s.level === level)));
	},
};
