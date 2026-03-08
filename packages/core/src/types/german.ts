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

export type Category = "vocab" | "verbs" | "nouns" | "adjectives" | "dictionary" | "starred";
export type VocabDirection = "de_to_en" | "en_to_de";

/** Exercise categories (excludes "dictionary" which is a separate mode). */
export const CATEGORIES: { value: Category; label: string }[] = [
	{ value: "vocab", label: "Vocabulary" },
	{ value: "verbs", label: "Verbs" },
	{ value: "nouns", label: "Nouns" },
	{ value: "adjectives", label: "Adjectives" },
];

export const VOCAB_DIRECTIONS: { value: VocabDirection; label: string }[] = [
	{ value: "de_to_en", label: "German \u2192 English" },
	{ value: "en_to_de", label: "English \u2192 German" },
];

export const BATCH_SIZES = [10, 20, 50, 100] as const;

export const STEP_TITLES = {
	level: "Select Level",
	category: "Select Category",
	vocabDirection: "Select Direction",
	batchSize: "Select Batch Size",
} as const;

export const WORD_COUNTER_INFO = {
	level:
		"This counter tracks how many unique words you've seen across all sessions for this level. It helps you monitor your vocabulary coverage.",
	allLevels:
		"This counter tracks how many unique words you've seen across all sessions and all levels. It helps you monitor your overall vocabulary coverage.",
} as const;

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
	/** Present when reviewing starred words across levels. */
	level?: Level | undefined;
}
