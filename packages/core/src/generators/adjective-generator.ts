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
		answer: `${prefix}${declined} ${noun}`,
	};
}

function komparativCard(adj: Adjective): Card {
	const form = adj.komparativ ?? `${adj.word}er`;
	return {
		id: `adj-komp-${adj.word}`,
		question: `Komparativ von "${adj.word}"?`,
		answer: form,
	};
}

function superlativCard(adj: Adjective): Card {
	const form = adj.superlativ ?? `${adj.word}sten`;
	return {
		id: `adj-super-${adj.word}`,
		question: `Superlativ von "${adj.word}"?`,
		answer: `am ${form}`,
	};
}

export function generateAdjectiveCards(adjectives: Adjective[], batchSize: number): Card[] {
	const paradigms: AdjectiveParadigm[] = [
		"definite",
		"no_article",
		"indefinite_possessive_or_kein",
	];
	const cards: Card[] = [];

	for (const adj of adjectives) {
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
