import type { Card, SessionConfig } from "../types/german.js";

export interface SessionHistoryStorage {
	getExcludedWords(key: string): Promise<string[]>;
	saveSessionWords(key: string, words: string[]): Promise<void>;
	getEncounteredWords(level: string): Promise<string[]>;
	saveEncounteredWords(level: string, words: string[]): Promise<void>;
	resetEncounteredWords(level: string): Promise<void>;
}

export function sessionHistoryKey(config: SessionConfig): string | null {
	if (config.category === "dictionary" || config.category === "starred") return null;
	return `${config.level}-${config.category}`;
}

export function extractBaseWord(cardId: string): string {
	const parts = cardId.split("-");
	const prefix = parts[0];

	switch (prefix) {
		case "vocab":
			// vocab-{type}-{dir}-{word}
			return parts.slice(3).join("-");
		case "noun":
			// noun-gender-{word}, noun-plural-{word}, noun-{case}-{number}-{word}
			if (parts[1] === "gender" || parts[1] === "plural") {
				return parts.slice(2).join("-");
			}
			return parts.slice(3).join("-");
		case "verb":
			// verb-{tense}-{infinitiv}-{person} — person is last, infinitiv is parts[2]
			return parts[2]!;
		case "adj":
			// adj-komp-{word}, adj-super-{word}, adj-{paradigm}-{case}-{gender}-{word}
			if (parts[1] === "komp" || parts[1] === "super") {
				return parts.slice(2).join("-");
			}
			return parts.slice(4).join("-");
		default:
			return cardId;
	}
}

export function extractBaseWords(cards: Card[]): string[] {
	const words = new Set<string>();
	for (const card of cards) {
		words.add(extractBaseWord(card.id));
	}
	return [...words];
}
