import type { AdjectiveParadigm, Case, GenderOrPlural } from "../types/german.js";

type EndingMatrix = Record<Case, Record<GenderOrPlural, string>>;

/** No article present — adjective carries the full gender/case signal. */
const NO_ARTICLE: EndingMatrix = {
	nom: { m: "er", f: "e", n: "es", pl: "e" },
	acc: { m: "en", f: "e", n: "es", pl: "e" },
	dat: { m: "em", f: "er", n: "em", pl: "en" },
	gen: { m: "en", f: "er", n: "en", pl: "er" },
};

/** After definite article (der/die/das) — article already signals gender/case. */
const DEFINITE: EndingMatrix = {
	nom: { m: "e", f: "e", n: "e", pl: "en" },
	acc: { m: "en", f: "e", n: "e", pl: "en" },
	dat: { m: "en", f: "en", n: "en", pl: "en" },
	gen: { m: "en", f: "en", n: "en", pl: "en" },
};

/** After indefinite/possessive/kein (ein/eine/mein/kein) — hybrid: some slots need strong endings. */
const INDEFINITE_POSSESSIVE_OR_KEIN: EndingMatrix = {
	nom: { m: "er", f: "e", n: "es", pl: "en" },
	acc: { m: "en", f: "e", n: "es", pl: "en" },
	dat: { m: "en", f: "en", n: "en", pl: "en" },
	gen: { m: "en", f: "en", n: "en", pl: "en" },
};

const PARADIGMS: Record<AdjectiveParadigm, EndingMatrix> = {
	no_article: NO_ARTICLE,
	definite: DEFINITE,
	indefinite_possessive_or_kein: INDEFINITE_POSSESSIVE_OR_KEIN,
};

export function declineAdjective(
	word: string,
	paradigm: AdjectiveParadigm,
	grammaticalCase: Case,
	gender: GenderOrPlural,
): string {
	const ending = PARADIGMS[paradigm][grammaticalCase][gender];
	return `${word}${ending}`;
}
