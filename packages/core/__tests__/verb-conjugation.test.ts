import { describe, expect, it } from "vitest";
import {
	conjugateKonjunktivII,
	conjugatePerfekt,
	conjugatePraeteritum,
	conjugatePresent,
} from "../src/engine/verb-conjugation.js";
import type { Verb } from "../src/schemas/index.js";
import type { Person } from "../src/types/german.js";

// --- Test fixtures ---

const machen: Verb = {
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
};

const gehen: Verb = {
	infinitiv: "gehen",
	type: "irregular",
	auxiliary: "sein",
	stem_change_pres: null,
	present_forms: null,
	praeteritum_root: "ging",
	partizip_ii: "gegangen",
	konjunktiv_ii_root: "ging",
	prepositions: [],
	connections: [],
	level: "A1",
	meaning: "to go",
	example: "Wir gehen in die Schule.",
};

const geben: Verb = {
	infinitiv: "geben",
	type: "irregular",
	auxiliary: "haben",
	stem_change_pres: "e→i",
	present_forms: null,
	praeteritum_root: "gab",
	partizip_ii: "gegeben",
	konjunktiv_ii_root: "gäb",
	prepositions: [],
	connections: [],
	level: "A1",
	meaning: "to give",
	example: "Er gibt mir das Buch.",
};

const bringen: Verb = {
	infinitiv: "bringen",
	type: "mixed",
	auxiliary: "haben",
	stem_change_pres: null,
	present_forms: null,
	praeteritum_root: "brach",
	partizip_ii: "gebracht",
	konjunktiv_ii_root: "bräch",
	prepositions: [],
	connections: [],
	level: "A1",
	meaning: "to bring",
	example: "Kannst du mir ein Glas Wasser bringen?",
};

const warten: Verb = {
	infinitiv: "warten",
	type: "regular",
	auxiliary: "haben",
	stem_change_pres: null,
	present_forms: null,
	praeteritum_root: "warte",
	partizip_ii: "gewartet",
	konjunktiv_ii_root: null,
	prepositions: [{ preposition: "auf", case: "acc" as const, meaning: "to wait for" }],
	connections: [],
	level: "A1",
	meaning: "to wait",
	example: "Ich warte auf den Bus.",
};

const koennen: Verb = {
	infinitiv: "können",
	type: "irregular",
	auxiliary: "haben",
	stem_change_pres: null,
	present_forms: {
		ich: "kann",
		du: "kannst",
		"er/sie/es": "kann",
		wir: "können",
		ihr: "könnt",
		"sie/Sie": "können",
	},
	praeteritum_root: "konnt",
	partizip_ii: "gekonnt",
	konjunktiv_ii_root: "könnt",
	prepositions: [],
	connections: [],
	level: "A1",
	meaning: "can",
	example: "Kannst du Deutsch sprechen?",
};

// --- Tests ---

describe("conjugatePresent", () => {
	describe("regular verb (machen)", () => {
		const cases: [Person, string][] = [
			["ich", "mache"],
			["du", "machst"],
			["er/sie/es", "macht"],
			["wir", "machen"],
			["ihr", "macht"],
			["sie/Sie", "machen"],
		];

		for (const [person, expected] of cases) {
			it(`${person} → ${expected}`, () => {
				expect(conjugatePresent(machen, person)).toBe(expected);
			});
		}
	});

	describe("irregular verb with stem change e→i (geben)", () => {
		it("du → gibst", () => {
			expect(conjugatePresent(geben, "du")).toBe("gibst");
		});

		it("er/sie/es → gibt", () => {
			expect(conjugatePresent(geben, "er/sie/es")).toBe("gibt");
		});

		it("ich → gebe (no stem change for ich)", () => {
			expect(conjugatePresent(geben, "ich")).toBe("gebe");
		});

		it("wir → geben (no stem change for wir)", () => {
			expect(conjugatePresent(geben, "wir")).toBe("geben");
		});
	});

	describe("t/d stem buffer (warten)", () => {
		const cases: [Person, string][] = [
			["ich", "warte"],
			["du", "wartest"],
			["er/sie/es", "wartet"],
			["wir", "warten"],
			["ihr", "wartet"],
			["sie/Sie", "warten"],
		];

		for (const [person, expected] of cases) {
			it(`${person} → ${expected}`, () => {
				expect(conjugatePresent(warten, person)).toBe(expected);
			});
		}
	});

	describe("present_forms override (können)", () => {
		const cases: [Person, string][] = [
			["ich", "kann"],
			["du", "kannst"],
			["er/sie/es", "kann"],
			["wir", "können"],
			["ihr", "könnt"],
			["sie/Sie", "können"],
		];

		for (const [person, expected] of cases) {
			it(`${person} → ${expected}`, () => {
				expect(conjugatePresent(koennen, person)).toBe(expected);
			});
		}
	});
});

describe("conjugatePraeteritum", () => {
	describe("regular verb (machen)", () => {
		const cases: [Person, string][] = [
			["ich", "machte"],
			["du", "machtest"],
			["er/sie/es", "machte"],
			["wir", "machten"],
			["ihr", "machtet"],
			["sie/Sie", "machten"],
		];

		for (const [person, expected] of cases) {
			it(`${person} → ${expected}`, () => {
				expect(conjugatePraeteritum(machen, person)).toBe(expected);
			});
		}
	});

	describe("irregular verb (gehen)", () => {
		const cases: [Person, string][] = [
			["ich", "ging"],
			["du", "gingst"],
			["er/sie/es", "ging"],
			["wir", "gingen"],
			["ihr", "gingt"],
			["sie/Sie", "gingen"],
		];

		for (const [person, expected] of cases) {
			it(`${person} → ${expected}`, () => {
				expect(conjugatePraeteritum(gehen, person)).toBe(expected);
			});
		}
	});

	describe("mixed verb (bringen) uses regular endings", () => {
		const cases: [Person, string][] = [
			["ich", "brachte"],
			["du", "brachtest"],
			["er/sie/es", "brachte"],
			["wir", "brachten"],
			["ihr", "brachtet"],
			["sie/Sie", "brachten"],
		];

		for (const [person, expected] of cases) {
			it(`${person} → ${expected}`, () => {
				expect(conjugatePraeteritum(bringen, person)).toBe(expected);
			});
		}
	});
});

describe("conjugatePerfekt", () => {
	it("haben auxiliary (machen): ich habe gemacht", () => {
		expect(conjugatePerfekt(machen, "ich")).toBe("habe gemacht");
	});

	it("sein auxiliary (gehen): ich bin gegangen", () => {
		expect(conjugatePerfekt(gehen, "ich")).toBe("bin gegangen");
	});

	it("haben auxiliary (geben): er/sie/es hat gegeben", () => {
		expect(conjugatePerfekt(geben, "er/sie/es")).toBe("hat gegeben");
	});

	it("sein auxiliary (gehen): wir sind gegangen", () => {
		expect(conjugatePerfekt(gehen, "wir")).toBe("sind gegangen");
	});

	it("haben auxiliary (bringen): du hast gebracht", () => {
		expect(conjugatePerfekt(bringen, "du")).toBe("hast gebracht");
	});
});

describe("conjugateKonjunktivII", () => {
	describe("regular verb uses würde + infinitiv", () => {
		const cases: [Person, string][] = [
			["ich", "würde machen"],
			["du", "würdest machen"],
			["er/sie/es", "würde machen"],
			["wir", "würden machen"],
			["ihr", "würdet machen"],
			["sie/Sie", "würden machen"],
		];

		for (const [person, expected] of cases) {
			it(`${person} → ${expected}`, () => {
				expect(conjugateKonjunktivII(machen, person)).toBe(expected);
			});
		}
	});

	describe("irregular verb uses K2 endings (geben → gäb-)", () => {
		const cases: [Person, string][] = [
			["ich", "gäbe"],
			["du", "gäbest"],
			["er/sie/es", "gäbe"],
			["wir", "gäben"],
			["ihr", "gäbet"],
			["sie/Sie", "gäben"],
		];

		for (const [person, expected] of cases) {
			it(`${person} → ${expected}`, () => {
				expect(conjugateKonjunktivII(geben, person)).toBe(expected);
			});
		}
	});

	describe("mixed verb uses Präteritum-style (-te) endings (bringen → bräch-)", () => {
		const cases: [Person, string][] = [
			["ich", "brächte"],
			["du", "brächtest"],
			["er/sie/es", "brächte"],
			["wir", "brächten"],
			["ihr", "brächtet"],
			["sie/Sie", "brächten"],
		];

		for (const [person, expected] of cases) {
			it(`${person} → ${expected}`, () => {
				expect(conjugateKonjunktivII(bringen, person)).toBe(expected);
			});
		}
	});

	describe("irregular verb (gehen → ging-)", () => {
		it("ich → ginge", () => {
			expect(conjugateKonjunktivII(gehen, "ich")).toBe("ginge");
		});

		it("du → gingest", () => {
			expect(conjugateKonjunktivII(gehen, "du")).toBe("gingest");
		});
	});

	describe("irregular verb with K2 override (können → könnt-)", () => {
		it("ich → könnte", () => {
			expect(conjugateKonjunktivII(koennen, "ich")).toBe("könnte");
		});

		it("wir → könnten", () => {
			expect(conjugateKonjunktivII(koennen, "wir")).toBe("könnten");
		});
	});
});
