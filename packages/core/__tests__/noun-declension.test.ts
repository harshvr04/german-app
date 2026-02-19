import { describe, expect, it } from "vitest";
import { declineNoun, getArticle } from "../src/engine/noun-declension.js";
import type { Noun } from "../src/schemas/index.js";

// --- Test fixtures ---

const tisch: Noun = {
	word: "Tisch",
	gender: "m",
	plural_suffix: "-e",
	is_n_dekl: false,
	level: "A1",
	meaning: "table",
	example: "Der Tisch ist groß.",
};

const lampe: Noun = {
	word: "Lampe",
	gender: "f",
	plural_suffix: "-n",
	is_n_dekl: false,
	level: "A1",
	meaning: "lamp",
	example: "Die Lampe ist kaputt.",
};

const buch: Noun = {
	word: "Buch",
	gender: "n",
	plural_suffix: "¨er",
	is_n_dekl: false,
	level: "A1",
	meaning: "book",
	example: "Ich lese ein Buch.",
};

const student: Noun = {
	word: "Student",
	gender: "m",
	plural_suffix: "-en",
	is_n_dekl: true,
	level: "A1",
	meaning: "student (male)",
	example: "Der Student lernt Deutsch.",
};

const haus: Noun = {
	word: "Haus",
	gender: "n",
	plural_suffix: "¨er",
	is_n_dekl: false,
	level: "A1",
	meaning: "house",
	example: "Das Haus ist sehr alt.",
};

// --- Tests ---

describe("getArticle", () => {
	it("nominative articles", () => {
		expect(getArticle("m", "nom", "singular")).toBe("der");
		expect(getArticle("f", "nom", "singular")).toBe("die");
		expect(getArticle("n", "nom", "singular")).toBe("das");
		expect(getArticle("m", "nom", "plural")).toBe("die");
	});

	it("accusative articles", () => {
		expect(getArticle("m", "acc", "singular")).toBe("den");
		expect(getArticle("f", "acc", "singular")).toBe("die");
		expect(getArticle("n", "acc", "singular")).toBe("das");
	});

	it("dative articles", () => {
		expect(getArticle("m", "dat", "singular")).toBe("dem");
		expect(getArticle("f", "dat", "singular")).toBe("der");
		expect(getArticle("n", "dat", "singular")).toBe("dem");
		expect(getArticle("m", "dat", "plural")).toBe("den");
	});

	it("genitive articles", () => {
		expect(getArticle("m", "gen", "singular")).toBe("des");
		expect(getArticle("f", "gen", "singular")).toBe("der");
		expect(getArticle("n", "gen", "singular")).toBe("des");
		expect(getArticle("m", "gen", "plural")).toBe("der");
	});
});

describe("declineNoun — regular masculine (Tisch)", () => {
	it("nom sg → der Tisch", () => {
		const r = declineNoun(tisch, "nom", "singular");
		expect(r).toEqual({ article: "der", noun: "Tisch" });
	});

	it("acc sg → den Tisch", () => {
		const r = declineNoun(tisch, "acc", "singular");
		expect(r).toEqual({ article: "den", noun: "Tisch" });
	});

	it("dat sg → dem Tisch", () => {
		const r = declineNoun(tisch, "dat", "singular");
		expect(r).toEqual({ article: "dem", noun: "Tisch" });
	});

	it("gen sg → des Tischs (genitive -s)", () => {
		const r = declineNoun(tisch, "gen", "singular");
		expect(r).toEqual({ article: "des", noun: "Tischs" });
	});

	it("nom pl → die Tische (plural -e)", () => {
		const r = declineNoun(tisch, "nom", "plural");
		expect(r).toEqual({ article: "die", noun: "Tische" });
	});

	it("dat pl → den Tischen (dativ plural -n)", () => {
		const r = declineNoun(tisch, "dat", "plural");
		expect(r).toEqual({ article: "den", noun: "Tischen" });
	});
});

describe("declineNoun — feminine (Lampe)", () => {
	it("nom sg → die Lampe", () => {
		expect(declineNoun(lampe, "nom", "singular")).toEqual({ article: "die", noun: "Lampe" });
	});

	it("gen sg → der Lampe (no genitive suffix for feminine)", () => {
		expect(declineNoun(lampe, "gen", "singular")).toEqual({ article: "der", noun: "Lampe" });
	});

	it("nom pl → die Lampen", () => {
		expect(declineNoun(lampe, "nom", "plural")).toEqual({ article: "die", noun: "Lampen" });
	});

	it("dat pl → den Lampen (already ends in -n)", () => {
		expect(declineNoun(lampe, "dat", "plural")).toEqual({ article: "den", noun: "Lampen" });
	});
});

describe("declineNoun — neuter with umlaut plural (Buch → Bücher)", () => {
	it("nom pl → die Bücher", () => {
		const r = declineNoun(buch, "nom", "plural");
		expect(r).toEqual({ article: "die", noun: "Bücher" });
	});

	it("dat pl → den Büchern", () => {
		const r = declineNoun(buch, "dat", "plural");
		expect(r).toEqual({ article: "den", noun: "Büchern" });
	});

	it("gen sg → des Buchs (or Buches)", () => {
		const r = declineNoun(buch, "gen", "singular");
		expect(r).toEqual({ article: "des", noun: "Buchs" });
	});
});

describe("declineNoun — neuter with umlaut plural (Haus → Häuser)", () => {
	it("nom pl → die Häuser", () => {
		const r = declineNoun(haus, "nom", "plural");
		expect(r).toEqual({ article: "die", noun: "Häuser" });
	});

	it("gen sg → des Hauses (-es after sibilant)", () => {
		const r = declineNoun(haus, "gen", "singular");
		expect(r).toEqual({ article: "des", noun: "Hauses" });
	});
});

describe("declineNoun — N-Deklination (Student)", () => {
	it("nom sg → der Student (unchanged in nominative)", () => {
		expect(declineNoun(student, "nom", "singular")).toEqual({ article: "der", noun: "Student" });
	});

	it("acc sg → den Studenten", () => {
		expect(declineNoun(student, "acc", "singular")).toEqual({ article: "den", noun: "Studenten" });
	});

	it("dat sg → dem Studenten", () => {
		expect(declineNoun(student, "dat", "singular")).toEqual({ article: "dem", noun: "Studenten" });
	});

	it("gen sg → des Studenten", () => {
		expect(declineNoun(student, "gen", "singular")).toEqual({ article: "des", noun: "Studenten" });
	});

	it("nom pl → die Studenten", () => {
		expect(declineNoun(student, "nom", "plural")).toEqual({ article: "die", noun: "Studenten" });
	});
});
