import { declineAdjective } from "../engine/adjective-declension.js";
import type { Adjective } from "../schemas/index.js";
import type { AdjectiveParadigm, Card, Case, GenderOrPlural } from "../types/german.js";
import { shuffle } from "./shuffle.js";

const CASES: Case[] = ["nom", "acc", "dat", "gen"];
const GENDERS: GenderOrPlural[] = ["m", "f", "n", "pl"];

const PARADIGM_EXAMPLES: Record<AdjectiveParadigm, (g: GenderOrPlural) => string> = {
	definite: (g) => {
		const map = { m: "der", f: "die", n: "das", pl: "die" } as const;
		return map[g];
	},
	no_article: () => "",
	indefinite_possessive_or_kein: (g) => {
		const map = { m: "ein", f: "eine", n: "ein", pl: "keine" } as const;
		return map[g];
	},
};

const SAMPLE_NOUNS: Record<GenderOrPlural, string> = {
	m: "Mann",
	f: "Frau",
	n: "Kind",
	pl: "Leute",
};

const CASE_LABELS: Record<Case, string> = {
	nom: "NOM",
	acc: "ACC",
	dat: "DAT",
	gen: "GEN",
};

const PARADIGM_LABELS: Record<AdjectiveParadigm, string> = {
	definite: "After definite article (der/die/das)",
	no_article: "No article",
	indefinite_possessive_or_kein: "After ein/kein/possessive",
};

function buildDeclensionRow(
	adj: Adjective,
	paradigm: AdjectiveParadigm,
	grammaticalCase: Case,
): string {
	const header = `${PARADIGM_LABELS[paradigm]}: ${adj.word} (${CASE_LABELS[grammaticalCase]})`;
	const cells = GENDERS.map((g) => {
		const art = PARADIGM_EXAMPLES[paradigm](g);
		const declined = declineAdjective(adj.word, paradigm, grammaticalCase, g);
		const form = art ? `${art} ${declined}` : declined;
		return `${g}: ${form}`;
	}).join("\n");
	return `${header}\n${cells}`;
}

function makeDeclensionCard(
	adj: Adjective,
	paradigm: AdjectiveParadigm,
	grammaticalCase: Case,
	gender: GenderOrPlural,
): Card {
	const article = PARADIGM_EXAMPLES[paradigm](gender);
	const noun = SAMPLE_NOUNS[gender];
	const declined = declineAdjective(adj.word, paradigm, grammaticalCase, gender);
	const prefix = article ? `${article} ` : "";

	return {
		id: `adj-${paradigm}-${grammaticalCase}-${gender}-${adj.word}`,
		question: `${prefix}_____ ${noun} (${adj.word}, ${grammaticalCase.toUpperCase()})`,
		hint: adj.meaning,
		answer: `${prefix}${declined} ${noun}`,
		details: buildDeclensionRow(adj, paradigm, grammaticalCase),
	};
}

function stripAm(s: string): string {
	return s.startsWith("am ") ? s.slice(3) : s;
}

function buildComparisonTable(adj: Adjective): string {
	const komp = adj.komparativ ?? `${adj.word}er`;
	const sup = adj.superlativ ? stripAm(adj.superlativ) : `${adj.word}sten`;
	return `Positiv:     ${adj.word}\nKomparativ:  ${komp}\nSuperlativ:  am ${sup}`;
}

function komparativCard(adj: Adjective): Card {
	const form = adj.komparativ ?? `${adj.word}er`;
	return {
		id: `adj-komp-${adj.word}`,
		question: `Komparativ von "${adj.word}"?`,
		hint: adj.meaning,
		answer: form,
		details: buildComparisonTable(adj),
	};
}

function superlativCard(adj: Adjective): Card {
	const form = adj.superlativ ? stripAm(adj.superlativ) : `${adj.word}sten`;
	return {
		id: `adj-super-${adj.word}`,
		question: `Superlativ von "${adj.word}"?`,
		hint: adj.meaning,
		answer: `am ${form}`,
		details: buildComparisonTable(adj),
	};
}

export function generateAdjectiveCards(
	adjectives: Adjective[],
	batchSize: number,
	excludeWords: string[] = [],
): Card[] {
	const excluded = new Set(excludeWords);
	const filtered = excluded.size > 0 ? adjectives.filter((a) => !excluded.has(a.word)) : adjectives;
	const paradigms: AdjectiveParadigm[] = [
		"definite",
		"no_article",
		"indefinite_possessive_or_kein",
	];
	const cards: Card[] = [];

	for (const adj of filtered) {
		if (!adj.is_declinable) continue;

		if (adj.is_comparable) {
			cards.push(komparativCard(adj));
			cards.push(superlativCard(adj));
		}

		for (const p of paradigms) {
			const c = CASES[Math.floor(Math.random() * CASES.length)]!;
			const g = GENDERS[Math.floor(Math.random() * GENDERS.length)]!;
			cards.push(makeDeclensionCard(adj, p, c, g));
		}
	}

	return shuffle(cards).slice(0, batchSize);
}
