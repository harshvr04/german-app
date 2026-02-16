import type { Noun } from "../schemas/index.js";
import type { Case, Gender, GrammaticalNumber } from "../types/german.js";

type ArticleTable = Record<Case, Record<Gender, string>> & Record<Case, { pl: string }>;

const DEFINITE_ARTICLES: ArticleTable = {
	nom: { m: "der", f: "die", n: "das", pl: "die" },
	acc: { m: "den", f: "die", n: "das", pl: "die" },
	dat: { m: "dem", f: "der", n: "dem", pl: "den" },
	gen: { m: "des", f: "der", n: "des", pl: "der" },
};

function applyPluralSuffix(word: string, suffix: string): string {
	const normalized = suffix.trim();
	if (normalized === "∅") return word;

	const hasUmlaut = normalized.startsWith("¨");
	let base = word;

	if (hasUmlaut) {
		const umlautMap: Record<string, string> = {
			a: "ä",
			o: "ö",
			u: "ü",
			A: "Ä",
			O: "Ö",
			U: "Ü",
			au: "äu",
			Au: "Äu",
		};

		for (const [from, to] of Object.entries(umlautMap)) {
			const idx = base.lastIndexOf(from);
			if (idx !== -1) {
				base = base.slice(0, idx) + to + base.slice(idx + from.length);
				break;
			}
		}
	}

	const ending = hasUmlaut ? normalized.slice(1) : normalized;

	if (ending.startsWith("-")) {
		return base + ending.slice(1);
	}

	return base + ending;
}

function applyNDeklination(word: string, grammaticalCase: Case, number: GrammaticalNumber): string {
	if (number === "singular" && grammaticalCase === "nom") return word;
	if (word.endsWith("e")) return `${word}n`;
	return `${word}en`;
}

function applyGenitiveSuffix(word: string): string {
	if (word.endsWith("s") || word.endsWith("ß") || word.endsWith("z") || word.endsWith("x")) {
		return `${word}es`;
	}
	return `${word}s`;
}

export function getArticle(
	gender: Gender,
	grammaticalCase: Case,
	number: GrammaticalNumber,
): string {
	if (number === "plural") {
		return DEFINITE_ARTICLES[grammaticalCase].pl;
	}
	return DEFINITE_ARTICLES[grammaticalCase][gender];
}

export interface DeclinedNoun {
	article: string;
	noun: string;
}

export function declineNoun(
	noun: Noun,
	grammaticalCase: Case,
	number: GrammaticalNumber,
): DeclinedNoun {
	const article = getArticle(noun.gender, grammaticalCase, number);

	if (number === "plural") {
		let pluralForm = applyPluralSuffix(noun.word, noun.plural_suffix);

		if (grammaticalCase === "dat" && !pluralForm.endsWith("n") && !pluralForm.endsWith("s")) {
			pluralForm += "n";
		}

		return { article, noun: pluralForm };
	}

	let word = noun.word;

	if (noun.is_n_dekl) {
		word = applyNDeklination(word, grammaticalCase, number);
	} else if (grammaticalCase === "gen" && (noun.gender === "m" || noun.gender === "n")) {
		word = applyGenitiveSuffix(word);
	}

	return { article, noun: word };
}
