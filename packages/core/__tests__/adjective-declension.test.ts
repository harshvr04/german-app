import { describe, expect, it } from "vitest";
import { declineAdjective } from "../src/engine/adjective-declension.js";
import type { AdjectiveParadigm, Case, GenderOrPlural } from "../src/types/german.js";

describe("declineAdjective", () => {
	describe("no_article (strong endings)", () => {
		const p: AdjectiveParadigm = "no_article";

		const expected: Record<Case, Record<GenderOrPlural, string>> = {
			nom: { m: "guter", f: "gute", n: "gutes", pl: "gute" },
			acc: { m: "guten", f: "gute", n: "gutes", pl: "gute" },
			dat: { m: "gutem", f: "guter", n: "gutem", pl: "guten" },
			gen: { m: "guten", f: "guter", n: "guten", pl: "guter" },
		};

		for (const [c, genders] of Object.entries(expected)) {
			for (const [g, form] of Object.entries(genders)) {
				it(`${c} ${g} → ${form}`, () => {
					expect(declineAdjective("gut", p, c as Case, g as GenderOrPlural)).toBe(form);
				});
			}
		}
	});

	describe("definite (weak endings)", () => {
		const p: AdjectiveParadigm = "definite";

		const expected: Record<Case, Record<GenderOrPlural, string>> = {
			nom: { m: "alte", f: "alte", n: "alte", pl: "alten" },
			acc: { m: "alten", f: "alte", n: "alte", pl: "alten" },
			dat: { m: "alten", f: "alten", n: "alten", pl: "alten" },
			gen: { m: "alten", f: "alten", n: "alten", pl: "alten" },
		};

		for (const [c, genders] of Object.entries(expected)) {
			for (const [g, form] of Object.entries(genders)) {
				it(`${c} ${g} → ${form}`, () => {
					expect(declineAdjective("alt", p, c as Case, g as GenderOrPlural)).toBe(form);
				});
			}
		}
	});

	describe("indefinite_possessive_or_kein (mixed endings)", () => {
		const p: AdjectiveParadigm = "indefinite_possessive_or_kein";

		const expected: Record<Case, Record<GenderOrPlural, string>> = {
			nom: { m: "kleiner", f: "kleine", n: "kleines", pl: "kleinen" },
			acc: { m: "kleinen", f: "kleine", n: "kleines", pl: "kleinen" },
			dat: { m: "kleinen", f: "kleinen", n: "kleinen", pl: "kleinen" },
			gen: { m: "kleinen", f: "kleinen", n: "kleinen", pl: "kleinen" },
		};

		for (const [c, genders] of Object.entries(expected)) {
			for (const [g, form] of Object.entries(genders)) {
				it(`${c} ${g} → ${form}`, () => {
					expect(declineAdjective("klein", p, c as Case, g as GenderOrPlural)).toBe(form);
				});
			}
		}
	});
});
