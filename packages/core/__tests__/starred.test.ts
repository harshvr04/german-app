import { describe, expect, it } from "vitest";
import { generateStarredVocabCards } from "../src/generators/starred-vocab-generator.js";
import type { Adjective, Noun, Other, Verb } from "../src/schemas/index.js";
import { extractBaseWord, sessionHistoryKey } from "../src/session/history.js";
import type { StarredWord } from "../src/session/starred.js";
import type { Level } from "../src/types/german.js";

// --- Test fixtures ---

const nouns: Noun[] = [
	{
		word: "Tisch",
		gender: "m",
		plural_suffix: "-e",
		is_n_dekl: false,
		level: "A1",
		meaning: "table",
		example: "Der Tisch ist groß.",
	},
	{
		word: "Lampe",
		gender: "f",
		plural_suffix: "-n",
		is_n_dekl: false,
		level: "A2",
		meaning: "lamp",
		example: "Die Lampe ist kaputt.",
	},
];

const verbs: Verb[] = [
	{
		infinitiv: "machen",
		type: "regular",
		auxiliary: "haben",
		stem_change_pres: null,
		present_forms: null,
		praeteritum_root: "mach",
		partizip_ii: "gemacht",
		konjunktiv_ii_root: null,
		prepositions: [],
		connections: [],
		level: "A1",
		meaning: "to make",
		example: "Ich mache meine Hausaufgaben.",
	},
];

const adjectives: Adjective[] = [
	{
		word: "gut",
		is_declinable: true,
		is_comparable: true,
		komparativ: "besser",
		superlativ: "besten",
		level: "A1",
		meaning: "good",
		example: "Das Essen ist sehr gut.",
	},
];

const others: Other[] = [
	{
		word: "aber",
		level: "A1",
		meaning: "but / however",
		example: "Ich bin müde, aber ich lerne weiter.",
	},
];

// --- extractBaseWord ---

describe("extractBaseWord", () => {
	it("extracts word from vocab-noun card ID", () => {
		expect(extractBaseWord("vocab-noun-de-Tisch")).toBe("Tisch");
		expect(extractBaseWord("vocab-noun-en-Lampe")).toBe("Lampe");
	});

	it("extracts word from vocab-verb card ID", () => {
		expect(extractBaseWord("vocab-verb-de-machen")).toBe("machen");
		expect(extractBaseWord("vocab-verb-en-gehen")).toBe("gehen");
	});

	it("extracts word from vocab-adj card ID", () => {
		expect(extractBaseWord("vocab-adj-de-gut")).toBe("gut");
		expect(extractBaseWord("vocab-adj-en-groß")).toBe("groß");
	});

	it("extracts word from vocab-other card ID", () => {
		expect(extractBaseWord("vocab-other-de-aber")).toBe("aber");
	});

	it("handles hyphenated words", () => {
		expect(extractBaseWord("vocab-noun-de-E-Mail")).toBe("E-Mail");
	});
});

// --- sessionHistoryKey ---

describe("sessionHistoryKey", () => {
	it("returns null for starred category", () => {
		const key = sessionHistoryKey({ level: "A1", category: "starred", batchSize: 10 });
		expect(key).toBeNull();
	});

	it("returns null for dictionary category", () => {
		const key = sessionHistoryKey({ level: "A1", category: "dictionary", batchSize: 10 });
		expect(key).toBeNull();
	});

	it("returns level-category key for vocab", () => {
		const key = sessionHistoryKey({ level: "A1", category: "vocab", batchSize: 10 });
		expect(key).toBe("A1-vocab");
	});
});

// --- generateStarredVocabCards ---

describe("generateStarredVocabCards", () => {
	const dataA1 = { nouns: [nouns[0]!], verbs, adjectives, others };
	const dataA2 = { nouns: [nouns[1]!], verbs: [], adjectives: [], others: [] };

	function makeDataMap(levels: [Level, typeof dataA1][]) {
		return new Map(levels);
	}

	it("generates cards for starred nouns", () => {
		const starred: StarredWord[] = [{ word: "Tisch", level: "A1" }];
		const dataByLevel = makeDataMap([["A1", dataA1]]);
		const cards = generateStarredVocabCards(starred, dataByLevel, "de_to_en");
		expect(cards.length).toBe(1);
		expect(cards[0]!.question).toBe("der Tisch");
		expect(cards[0]!.answer).toBe("table");
	});

	it("generates cards for starred verbs", () => {
		const starred: StarredWord[] = [{ word: "machen", level: "A1" }];
		const dataByLevel = makeDataMap([["A1", dataA1]]);
		const cards = generateStarredVocabCards(starred, dataByLevel, "de_to_en");
		expect(cards.length).toBe(1);
		expect(cards[0]!.question).toBe("machen");
		expect(cards[0]!.answer).toBe("to make");
	});

	it("generates cards for starred adjectives", () => {
		const starred: StarredWord[] = [{ word: "gut", level: "A1" }];
		const dataByLevel = makeDataMap([["A1", dataA1]]);
		const cards = generateStarredVocabCards(starred, dataByLevel, "de_to_en");
		expect(cards.length).toBe(1);
		expect(cards[0]!.question).toBe("gut");
		expect(cards[0]!.answer).toBe("good");
	});

	it("generates cards for starred others", () => {
		const starred: StarredWord[] = [{ word: "aber", level: "A1" }];
		const dataByLevel = makeDataMap([["A1", dataA1]]);
		const cards = generateStarredVocabCards(starred, dataByLevel, "de_to_en");
		expect(cards.length).toBe(1);
		expect(cards[0]!.question).toBe("aber");
		expect(cards[0]!.answer).toBe("but / however");
	});

	it("sets level on each card", () => {
		const starred: StarredWord[] = [{ word: "Tisch", level: "A1" }];
		const dataByLevel = makeDataMap([["A1", dataA1]]);
		const cards = generateStarredVocabCards(starred, dataByLevel, "de_to_en");
		expect(cards[0]!.level).toBe("A1");
	});

	it("works with en_to_de direction", () => {
		const starred: StarredWord[] = [{ word: "Tisch", level: "A1" }];
		const dataByLevel = makeDataMap([["A1", dataA1]]);
		const cards = generateStarredVocabCards(starred, dataByLevel, "en_to_de");
		expect(cards[0]!.question).toBe("table");
		expect(cards[0]!.answer).toBe("der Tisch");
	});

	it("handles multiple starred words across levels", () => {
		const starred: StarredWord[] = [
			{ word: "Tisch", level: "A1" },
			{ word: "Lampe", level: "A2" },
		];
		const dataByLevel = makeDataMap([
			["A1", dataA1],
			["A2", dataA2],
		]);
		const cards = generateStarredVocabCards(starred, dataByLevel, "de_to_en");
		expect(cards.length).toBe(2);

		const tischCard = cards.find((c) => c.id.includes("Tisch"));
		const lampeCard = cards.find((c) => c.id.includes("Lampe"));
		expect(tischCard!.level).toBe("A1");
		expect(lampeCard!.level).toBe("A2");
	});

	it("skips starred words not found in data", () => {
		const starred: StarredWord[] = [{ word: "NonExistent", level: "A1" }];
		const dataByLevel = makeDataMap([["A1", dataA1]]);
		const cards = generateStarredVocabCards(starred, dataByLevel, "de_to_en");
		expect(cards.length).toBe(0);
	});

	it("skips starred words with missing level data", () => {
		const starred: StarredWord[] = [{ word: "Tisch", level: "C2" }];
		const dataByLevel = makeDataMap([["A1", dataA1]]);
		const cards = generateStarredVocabCards(starred, dataByLevel, "de_to_en");
		expect(cards.length).toBe(0);
	});

	it("returns empty array for empty starred list", () => {
		const dataByLevel = makeDataMap([["A1", dataA1]]);
		const cards = generateStarredVocabCards([], dataByLevel, "de_to_en");
		expect(cards.length).toBe(0);
	});

	it("generates unique IDs", () => {
		const starred: StarredWord[] = [
			{ word: "Tisch", level: "A1" },
			{ word: "machen", level: "A1" },
			{ word: "gut", level: "A1" },
			{ word: "aber", level: "A1" },
		];
		const dataByLevel = makeDataMap([["A1", dataA1]]);
		const cards = generateStarredVocabCards(starred, dataByLevel, "de_to_en");
		const ids = new Set(cards.map((c) => c.id));
		expect(ids.size).toBe(cards.length);
	});
});
