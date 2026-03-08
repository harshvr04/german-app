import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { StarredWord, StarredWordsStorage } from "@german/core/session";

const DIR = join(homedir(), ".german-app");
const FILE = join(DIR, "starred.json");

function readStarred(): StarredWord[] {
	if (!existsSync(FILE)) return [];
	try {
		return JSON.parse(readFileSync(FILE, "utf-8"));
	} catch {
		return [];
	}
}

function writeStarred(data: StarredWord[]): void {
	if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
	writeFileSync(FILE, JSON.stringify(data));
}

export const cliStarredStorage: StarredWordsStorage = {
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
