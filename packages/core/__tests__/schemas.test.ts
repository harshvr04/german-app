import { describe, expect, it } from "vitest";
import { AdjectiveSchema, NounSchema, OtherSchema, VerbSchema } from "../src/schemas/index.js";

describe("NounSchema", () => {
	const valid = {
		word: "Tisch",
		gender: "m",
		plural_suffix: "-e",
		is_n_dekl: false,
		level: "A1",
		meaning: "table",
		example: "Der Tisch ist groß.",
	};

	it("accepts a valid noun", () => {
		expect(NounSchema.parse(valid)).toEqual(valid);
	});

	it("accepts all genders", () => {
		for (const gender of ["m", "f", "n"]) {
			expect(NounSchema.parse({ ...valid, gender })).toBeDefined();
		}
	});

	it("accepts all levels", () => {
		for (const level of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
			expect(NounSchema.parse({ ...valid, level })).toBeDefined();
		}
	});

	it("rejects invalid gender", () => {
		expect(() => NounSchema.parse({ ...valid, gender: "x" })).toThrow();
	});

	it("rejects invalid level", () => {
		expect(() => NounSchema.parse({ ...valid, level: "D1" })).toThrow();
	});

	it("rejects missing fields", () => {
		const { word: _, ...rest } = valid;
		expect(() => NounSchema.parse(rest)).toThrow();
	});
});

describe("VerbSchema", () => {
	const valid = {
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
		meaning: "to make / to do",
		example: "Ich mache meine Hausaufgaben.",
	};

	it("accepts a valid regular verb", () => {
		expect(VerbSchema.parse(valid)).toEqual(valid);
	});

	it("accepts an irregular verb with stem change", () => {
		const geben = {
			...valid,
			infinitiv: "geben",
			type: "irregular",
			stem_change_pres: "e→i",
			praeteritum_root: "gab",
			partizip_ii: "gegeben",
			konjunktiv_ii_root: "gäb",
			meaning: "to give",
		};
		expect(VerbSchema.parse(geben)).toBeDefined();
	});

	it("accepts verb with present_forms override", () => {
		const koennen = {
			...valid,
			infinitiv: "können",
			type: "irregular",
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
			meaning: "can",
		};
		expect(VerbSchema.parse(koennen)).toBeDefined();
	});

	it("accepts verb with prepositions", () => {
		const warten = {
			...valid,
			infinitiv: "warten",
			prepositions: [{ preposition: "auf", case: "acc", meaning: "to wait for" }],
		};
		expect(VerbSchema.parse(warten)).toBeDefined();
	});

	it("rejects invalid verb type", () => {
		expect(() => VerbSchema.parse({ ...valid, type: "strong" })).toThrow();
	});

	it("rejects invalid auxiliary", () => {
		expect(() => VerbSchema.parse({ ...valid, auxiliary: "werden" })).toThrow();
	});

	it("rejects preposition with invalid case", () => {
		expect(() =>
			VerbSchema.parse({
				...valid,
				prepositions: [{ preposition: "auf", case: "nom", meaning: "x" }],
			}),
		).toThrow();
	});
});

describe("AdjectiveSchema", () => {
	const valid = {
		word: "gut",
		is_declinable: true,
		is_comparable: true,
		komparativ: "besser",
		superlativ: "besten",
		level: "A1",
		meaning: "good",
		example: "Das Essen ist sehr gut.",
	};

	it("accepts a valid adjective with irregular forms", () => {
		expect(AdjectiveSchema.parse(valid)).toEqual(valid);
	});

	it("accepts adjective with null komparativ/superlativ (regular)", () => {
		const klein = { ...valid, word: "klein", komparativ: null, superlativ: null };
		expect(AdjectiveSchema.parse(klein)).toBeDefined();
	});

	it("accepts indeclinable adjective", () => {
		const prima = {
			...valid,
			word: "prima",
			is_declinable: false,
			is_comparable: false,
			komparativ: null,
			superlativ: null,
		};
		expect(AdjectiveSchema.parse(prima)).toBeDefined();
	});

	it("accepts non-comparable adjective (Absolutadjektiv)", () => {
		const arbeitslos = {
			...valid,
			word: "arbeitslos",
			is_comparable: false,
			komparativ: null,
			superlativ: null,
		};
		expect(AdjectiveSchema.parse(arbeitslos)).toBeDefined();
	});

	it("rejects missing is_declinable", () => {
		const { is_declinable: _, ...rest } = valid;
		expect(() => AdjectiveSchema.parse(rest)).toThrow();
	});

	it("rejects missing is_comparable", () => {
		const { is_comparable: _, ...rest } = valid;
		expect(() => AdjectiveSchema.parse(rest)).toThrow();
	});
});

describe("OtherSchema", () => {
	const valid = {
		word: "aber",
		level: "A1",
		meaning: "but / however",
		example: "Ich bin müde, aber ich lerne weiter.",
	};

	it("accepts a valid other entry", () => {
		expect(OtherSchema.parse(valid)).toEqual(valid);
	});

	it("accepts all levels", () => {
		for (const level of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
			expect(OtherSchema.parse({ ...valid, level })).toBeDefined();
		}
	});

	it("rejects invalid level", () => {
		expect(() => OtherSchema.parse({ ...valid, level: "D1" })).toThrow();
	});

	it("rejects missing fields", () => {
		const { word: _, ...rest } = valid;
		expect(() => OtherSchema.parse(rest)).toThrow();
	});
});
