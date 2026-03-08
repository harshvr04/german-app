import type { Level } from "../types/german.js";

export interface StarredWord {
	word: string;
	level: Level;
}

export interface StarredWordsStorage {
	getStarredWords(): Promise<StarredWord[]>;
	addStarredWord(word: string, level: Level): Promise<void>;
	removeStarredWord(word: string, level: Level): Promise<void>;
}
