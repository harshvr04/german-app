import { describe, expect, it } from "vitest";
import { generateAdjectiveCards } from "../src/generators/adjective-generator.js";
import { generateNounCards } from "../src/generators/noun-generator.js";
import { generateVerbCards } from "../src/generators/verb-generator.js";
import { generateVocabCards } from "../src/generators/vocab-generator.js";
import type { Adjective, Noun, Other, Verb } from "../src/schemas/index.js";

// --- Shared fixtures ---

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
		level: "A1",
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
	{
		word: "prima",
		is_declinable: false,
		is_comparable: false,
		komparativ: null,
		superlativ: null,
		level: "A1",
		meaning: "great",
		example: "Das ist eine prima Idee!",
	},
];

// --- Vocab generator ---

describe("generateVocabCards", () => {
	it("generates cards for de_to_en direction", () => {
		const cards = generateVocabCards(nouns, verbs, adjectives, 100, "de_to_en");
		expect(cards.length).toBeGreaterThan(0);

		for (const card of cards) {
			expect(card.id).toContain("-de-");
			expect(card.id).toBeDefined();
			expect(card.question).toBeDefined();
			expect(card.answer).toBeDefined();
		}
	});

	it("generates cards for en_to_de direction", () => {
		const cards = generateVocabCards(nouns, verbs, adjectives, 100, "en_to_de");
		expect(cards.length).toBeGreaterThan(0);

		for (const card of cards) {
			expect(card.id).toContain("-en-");
		}
	});

	it("respects batch size limit", () => {
		const cards = generateVocabCards(nouns, verbs, adjectives, 2, "de_to_en");
		expect(cards.length).toBeLessThanOrEqual(2);
	});

	it("noun cards include article in de_to_en", () => {
		const cards = generateVocabCards(nouns, [], [], 100, "de_to_en");
		const tischCard = cards.find((c) => c.id.includes("Tisch"));
		expect(tischCard?.question).toBe("der Tisch");
		expect(tischCard?.answer).toBe("table");
	});

	it("noun cards include hint in en_to_de", () => {
		const cards = generateVocabCards(nouns, [], [], 100, "en_to_de");
		const tischCard = cards.find((c) => c.id.includes("Tisch"));
		expect(tischCard?.question).toBe("table");
		expect(tischCard?.answer).toBe("der Tisch");
		expect(tischCard?.hint).toBe("Include the article");
	});

	it("generates unique IDs", () => {
		const cards = generateVocabCards(nouns, verbs, adjectives, 100, "de_to_en");
		const ids = new Set(cards.map((c) => c.id));
		expect(ids.size).toBe(cards.length);
	});
});

// --- Noun generator ---

describe("generateNounCards", () => {
	it("generates gender, plural, and declension cards", () => {
		const cards = generateNounCards(nouns, 100);
		expect(cards.length).toBeGreaterThan(0);

		const genderCards = cards.filter((c) => c.id.includes("gender"));
		const pluralCards = cards.filter((c) => c.id.startsWith("noun-plural-"));
		expect(genderCards.length).toBe(nouns.length);
		expect(pluralCards.length).toBe(nouns.length);
	});

	it("gender card has correct format", () => {
		const cards = generateNounCards(nouns, 100);
		const genderCard = cards.find((c) => c.id === "noun-gender-Tisch");
		expect(genderCard).toBeDefined();
		expect(genderCard?.question).toBe("der / die / das Tisch?");
		expect(genderCard?.answer).toBe("der Tisch");
	});

	it("plural card has correct format", () => {
		const cards = generateNounCards(nouns, 100);
		const pluralCard = cards.find((c) => c.id === "noun-plural-Tisch");
		expect(pluralCard).toBeDefined();
		expect(pluralCard?.question).toBe("Plural von Tisch?");
		expect(pluralCard?.answer).toBe("die Tische");
	});

	it("respects batch size limit", () => {
		const cards = generateNounCards(nouns, 3);
		expect(cards.length).toBeLessThanOrEqual(3);
	});

	it("generates declension cards for acc, dat, gen", () => {
		const cards = generateNounCards(nouns, 100);
		const accCards = cards.filter((c) => c.id.includes("-acc-"));
		const datCards = cards.filter((c) => c.id.includes("-dat-"));
		const genCards = cards.filter((c) => c.id.includes("-gen-"));
		expect(accCards.length).toBeGreaterThan(0);
		expect(datCards.length).toBeGreaterThan(0);
		expect(genCards.length).toBeGreaterThan(0);
	});

	it("generates dativ plural cards", () => {
		const cards = generateNounCards(nouns, 100);
		const datPlCards = cards.filter((c) => c.id.includes("-dat-plural-"));
		expect(datPlCards.length).toBe(nouns.length);
	});

	it("noun cards include meaning as hint", () => {
		const cards = generateNounCards(nouns, 100);
		const tischCard = cards.find((c) => c.id === "noun-gender-Tisch");
		expect(tischCard?.hint).toBe("table");
	});

	it("noun cards include declension table in details", () => {
		const cards = generateNounCards(nouns, 100);
		const card = cards.find((c) => c.id === "noun-gender-Tisch");
		expect(card?.details).toBeDefined();
		expect(card?.details).toContain("Sg. / Pl.");
		expect(card?.details).toContain("NOM");
		expect(card?.details).toContain("ACC");
		expect(card?.details).toContain("DAT");
		expect(card?.details).toContain("GEN");
	});
});

// --- Verb generator ---

describe("generateVerbCards", () => {
	it("generates 2 cards per verb at A1 (Präsens + Perfekt)", () => {
		const cards = generateVerbCards(verbs, 100, [], "A1");
		expect(cards.length).toBe(2);
	});

	it("generates 4 cards per verb at A2", () => {
		const cards = generateVerbCards(verbs, 100, [], "A2");
		expect(cards.length).toBe(4);
	});

	it("generates 6 cards per verb at B1", () => {
		const cards = generateVerbCards(verbs, 100, [], "B1");
		expect(cards.length).toBe(6);
	});

	it("includes all tense types at B1", () => {
		const cards = generateVerbCards(verbs, 100, [], "B1");
		const types = cards.map((c) => c.id.split("-")[1]);
		expect(types).toContain("pres");
		expect(types).toContain("praet");
		expect(types).toContain("perfekt");
		expect(types).toContain("futur1");
		expect(types).toContain("plusq");
		expect(types).toContain("konj2");
	});

	it("respects batch size", () => {
		const cards = generateVerbCards(verbs, 2);
		expect(cards.length).toBeLessThanOrEqual(2);
	});

	it("card answers include conjugated form", () => {
		const manyVerbs: Verb[] = [verbs[0]!];
		const cards = generateVerbCards(manyVerbs, 100);
		for (const card of cards) {
			expect(card.answer).toBeDefined();
			expect(card.answer.length).toBeGreaterThan(0);
		}
	});

	it("verb cards include full conjugation table in details", () => {
		const cards = generateVerbCards(verbs, 100, [], "B1");
		for (const card of cards) {
			expect(card.details).toBeDefined();
			const lines = card.details!.split("\n");
			expect(lines.length).toBe(7);
			expect(lines[0]).toMatch(/Präsens|Präteritum|Perfekt|Futur I|Plusquamperfekt|Konjunktiv II/);
			expect(lines[1]).toMatch(/^ich /);
			expect(lines[6]).toMatch(/^sie\/Sie /);
		}
	});

	it("A1 only includes Präsens and Perfekt tenses", () => {
		const cards = generateVerbCards(verbs, 100, [], "A1");
		const types = cards.map((c) => c.id.split("-")[1]);
		expect(types).toContain("pres");
		expect(types).toContain("perfekt");
		expect(types).not.toContain("praet");
		expect(types).not.toContain("futur1");
		expect(types).not.toContain("plusq");
		expect(types).not.toContain("konj2");
	});

	it("A2 includes Präsens, Perfekt, Futur I, Präteritum", () => {
		const cards = generateVerbCards(verbs, 100, [], "A2");
		const types = cards.map((c) => c.id.split("-")[1]);
		expect(types).toContain("pres");
		expect(types).toContain("perfekt");
		expect(types).toContain("futur1");
		expect(types).toContain("praet");
		expect(types).not.toContain("plusq");
		expect(types).not.toContain("konj2");
	});

	it("verb cards include meaning as hint", () => {
		const cards = generateVerbCards(verbs, 100, [], "A1");
		for (const card of cards) {
			expect(card.hint).toBe("to make");
		}
	});

	it("generates 7 cards per verb at B2", () => {
		const cards = generateVerbCards(verbs, 100, [], "B2");
		expect(cards.length).toBe(7);
	});

	it("B2 includes all B1 tenses plus Konjunktiv I", () => {
		const cards = generateVerbCards(verbs, 100, [], "B2");
		const types = cards.map((c) => c.id.split("-")[1]);
		expect(types).toContain("pres");
		expect(types).toContain("perfekt");
		expect(types).toContain("futur1");
		expect(types).toContain("praet");
		expect(types).toContain("plusq");
		expect(types).toContain("konj2");
		expect(types).toContain("konj1");
	});

	it("B1 does not include Konjunktiv I", () => {
		const cards = generateVerbCards(verbs, 100, [], "B1");
		const types = cards.map((c) => c.id.split("-")[1]);
		expect(types).not.toContain("konj1");
	});

	it("excludes words correctly", () => {
		const cards = generateVerbCards(verbs, 100, ["machen"], "A1");
		expect(cards.length).toBe(0);
	});
});

// --- Adjective generator ---

describe("generateAdjectiveCards", () => {
	it("generates komparativ and superlativ cards only for comparable adjectives", () => {
		const cards = generateAdjectiveCards(adjectives, 100);
		const kompCards = cards.filter((c) => c.id.includes("komp"));
		const superCards = cards.filter((c) => c.id.includes("super"));
		const comparableCount = adjectives.filter((a) => a.is_declinable && a.is_comparable).length;
		expect(kompCards.length).toBe(comparableCount);
		expect(superCards.length).toBe(comparableCount);
	});

	it("skips komparativ/superlativ for non-comparable adjectives", () => {
		const nonComparable: Adjective[] = [
			{
				word: "arbeitslos",
				is_declinable: true,
				is_comparable: false,
				komparativ: null,
				superlativ: null,
				level: "A1",
				meaning: "unemployed",
				example: "Er ist arbeitslos.",
			},
		];
		const cards = generateAdjectiveCards(nonComparable, 100);
		const kompCards = cards.filter((c) => c.id.includes("komp"));
		const superCards = cards.filter((c) => c.id.includes("super"));
		expect(kompCards.length).toBe(0);
		expect(superCards.length).toBe(0);
		// But declension cards should still be generated
		const declCards = cards.filter((c) => c.id.includes("arbeitslos"));
		expect(declCards.length).toBe(3);
	});

	it("skips all cards for indeclinable adjectives", () => {
		const cards = generateAdjectiveCards(adjectives, 100);
		const primaCards = cards.filter((c) => c.id.includes("prima"));
		expect(primaCards.length).toBe(0);
	});

	it("generates declension cards for declinable adjectives", () => {
		const cards = generateAdjectiveCards(adjectives, 100);
		const gutDeclCards = cards.filter(
			(c) => c.id.includes("gut") && !c.id.includes("komp") && !c.id.includes("super"),
		);
		// 3 paradigms × 1 random case/gender each = 3
		expect(gutDeclCards.length).toBe(3);
	});

	it("komparativ uses irregular form when provided", () => {
		const cards = generateAdjectiveCards(adjectives, 100);
		const gutKomp = cards.find((c) => c.id === "adj-komp-gut");
		expect(gutKomp?.answer).toBe("besser");
	});

	it("komparativ uses regular form when null", () => {
		const regular: Adjective[] = [
			{
				word: "klein",
				is_declinable: true,
				is_comparable: true,
				komparativ: null,
				superlativ: null,
				level: "A1",
				meaning: "small",
				example: "Das Kind ist noch klein.",
			},
		];
		const cards = generateAdjectiveCards(regular, 100);
		const kleinKomp = cards.find((c) => c.id === "adj-komp-klein");
		expect(kleinKomp?.answer).toBe("kleiner");
	});

	it("superlativ uses irregular form when provided", () => {
		const cards = generateAdjectiveCards(adjectives, 100);
		const gutSuper = cards.find((c) => c.id === "adj-super-gut");
		expect(gutSuper?.answer).toBe("am besten");
	});

	it("superlativ uses regular form (no double 'am')", () => {
		const regular: Adjective[] = [
			{
				word: "klein",
				is_declinable: true,
				is_comparable: true,
				komparativ: null,
				superlativ: null,
				level: "A1",
				meaning: "small",
				example: "Das Kind ist noch klein.",
			},
		];
		const cards = generateAdjectiveCards(regular, 100);
		const kleinSuper = cards.find((c) => c.id === "adj-super-klein");
		expect(kleinSuper?.answer).toBe("am kleinsten");
	});

	it("respects batch size", () => {
		const cards = generateAdjectiveCards(adjectives, 3);
		expect(cards.length).toBeLessThanOrEqual(3);
	});

	it("adjective cards include meaning as hint", () => {
		const cards = generateAdjectiveCards(adjectives, 100);
		const kompCard = cards.find((c) => c.id === "adj-komp-gut");
		expect(kompCard?.hint).toBe("good");
	});

	it("declension cards include details for the asked case", () => {
		const cards = generateAdjectiveCards(adjectives, 100);
		const declCard = cards.find(
			(c) => c.id.startsWith("adj-definite-") || c.id.startsWith("adj-no_article-"),
		);
		expect(declCard?.details).toBeDefined();
		expect(declCard?.details).toMatch(/NOM|ACC|DAT|GEN/);
		expect(declCard?.details).toContain("m:");
		expect(declCard?.details).toContain("f:");
	});

	it("komparativ/superlativ cards include comparison table in details", () => {
		const cards = generateAdjectiveCards(adjectives, 100);
		const kompCard = cards.find((c) => c.id === "adj-komp-gut");
		expect(kompCard?.details).toContain("Positiv:");
		expect(kompCard?.details).toContain("Komparativ:");
		expect(kompCard?.details).toContain("Superlativ:");
	});
});

// --- Vocab generator with others ---

const others: Other[] = [
	{
		word: "aber",
		level: "A1",
		meaning: "but / however",
		example: "Ich bin müde, aber ich lerne weiter.",
	},
	{ word: "sehr", level: "A1", meaning: "very", example: "Das Essen ist sehr gut." },
];

describe("generateVocabCards with others", () => {
	it("includes other cards in vocab output", () => {
		const cards = generateVocabCards([], [], [], 100, "de_to_en", others);
		expect(cards.length).toBe(2);
		const aberCard = cards.find((c) => c.id.includes("aber"));
		expect(aberCard?.question).toBe("aber");
		expect(aberCard?.answer).toBe("but / however");
	});

	it("other de_to_en card shows example as hint", () => {
		const cards = generateVocabCards([], [], [], 100, "de_to_en", others);
		const aberCard = cards.find((c) => c.id.includes("aber"));
		expect(aberCard?.hint).toBe("Ich bin müde, aber ich lerne weiter.");
	});

	it("other en_to_de card shows example after reveal", () => {
		const cards = generateVocabCards([], [], [], 100, "en_to_de", others);
		const aberCard = cards.find((c) => c.id.includes("aber"));
		expect(aberCard?.question).toBe("but / however");
		expect(aberCard?.answer).toBe("aber");
		expect(aberCard?.example).toBe("Ich bin müde, aber ich lerne weiter.");
	});

	it("mixes others with nouns, verbs, adjectives", () => {
		const cards = generateVocabCards(nouns, verbs, adjectives, 100, "de_to_en", others);
		const otherCards = cards.filter((c) => c.id.includes("vocab-other"));
		expect(otherCards.length).toBe(others.length);
		expect(cards.length).toBe(nouns.length + verbs.length + adjectives.length + others.length);
	});
});
