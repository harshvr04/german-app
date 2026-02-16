/** Supported levels. Extend this tuple to add B2/C1/C2 — all types and schemas derive from it. */
export const LEVELS = ["A1", "A2", "B1"] as const;
export type Level = (typeof LEVELS)[number];

export type Gender = "m" | "f" | "n";
export type Case = "nom" | "acc" | "dat" | "gen";
export type GrammaticalNumber = "singular" | "plural";
export type Person = "ich" | "du" | "er/sie/es" | "wir" | "ihr" | "sie/Sie";
export type VerbType = "regular" | "irregular" | "mixed";
export type Auxiliary = "haben" | "sein";
export type AdjectiveParadigm = "no_article" | "definite" | "indefinite_possessive_or_kein";
export type GenderOrPlural = Gender | "pl";

export type Category = "vocab" | "verbs" | "nouns" | "adjectives";
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

export interface Card {
	id: string;
	question: string;
	answer: string;
	hint?: string;
}
