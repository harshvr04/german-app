/** Supported CEFR levels. All types and schemas derive from this tuple. */
export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Level = (typeof LEVELS)[number];

export type Gender = "m" | "f" | "n";
export type Case = "nom" | "acc" | "dat" | "gen";
export type GrammaticalNumber = "singular" | "plural";
export type Person = "ich" | "du" | "er/sie/es" | "wir" | "ihr" | "sie/Sie";
export type VerbType = "regular" | "irregular" | "mixed";
export type Auxiliary = "haben" | "sein";
export type AdjectiveParadigm = "no_article" | "definite" | "indefinite_possessive_or_kein";
export type GenderOrPlural = Gender | "pl";

export type Category = "vocab" | "verbs" | "nouns" | "adjectives" | "dictionary";
export type VocabDirection = "de_to_en" | "en_to_de";

export interface SessionConfig {
	level: Level;
	category: Category;
	batchSize: number;
	/** Only relevant when category is "vocab". */
	vocabDirection?: VocabDirection | undefined;
}

export interface SessionStats {
	totalCards: number;
	correctFirstAttempt: number;
	revisionRounds: number;
	startTime: number;
	endTime?: number;
}

export interface DictionaryEntry {
	word: string;
	meaning: string;
	example: string;
	level: Level;
}

export interface Card {
	id: string;
	question: string;
	answer: string;
	hint?: string;
	/** Example sentence shown alongside the German word. */
	example?: string;
	/** Optional extended details the user can reveal on demand (e.g. full conjugation table). */
	details?: string;
}
