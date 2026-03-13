import { declineNoun } from "../engine/noun-declension.js";
import type { Noun } from "../schemas/index.js";
import type { Card, Case, GrammaticalNumber } from "../types/german.js";
import { shuffle } from "./shuffle.js";

const ARTICLE_MAP = { m: "der", f: "die", n: "das" } as const;
const CASES: Case[] = ["nom", "acc", "dat", "gen"];
const CASE_LABELS: Record<Case, string> = { nom: "NOM", acc: "ACC", dat: "DAT", gen: "GEN" };

function buildNounTable(noun: Noun): string {
	const header = `${ARTICLE_MAP[noun.gender]} ${noun.word} (Sg. / Pl.)`;
	const rows = CASES.map((c) => {
		const sg = declineNoun(noun, c, "singular");
		const pl = declineNoun(noun, c, "plural");
		return `${CASE_LABELS[c]}  ${sg.article} ${sg.noun} / ${pl.article} ${pl.noun}`;
	}).join("\n");
	return `${header}\n${rows}`;
}

function genderCard(noun: Noun): Card {
	return {
		id: `noun-gender-${noun.word}`,
		question: `der / die / das ${noun.word}?`,
		hint: noun.meaning,
		answer: `${ARTICLE_MAP[noun.gender]} ${noun.word}`,
		details: buildNounTable(noun),
	};
}

function pluralCard(noun: Noun): Card {
	const { noun: pluralForm } = declineNoun(noun, "nom", "plural");
	return {
		id: `noun-plural-${noun.word}`,
		question: `Plural von ${noun.word}?`,
		hint: noun.meaning,
		answer: `die ${pluralForm}`,
		details: buildNounTable(noun),
	};
}

function declensionCard(noun: Noun, grammaticalCase: Case, number: GrammaticalNumber): Card {
	const { article, noun: form } = declineNoun(noun, grammaticalCase, number);
	const numLabel = number === "singular" ? "Sg." : "Pl.";
	const nomArticle = number === "singular" ? ARTICLE_MAP[noun.gender] : "die";
	const nomForm = number === "singular" ? noun.word : declineNoun(noun, "nom", "plural").noun;

	return {
		id: `noun-${grammaticalCase}-${number}-${noun.word}`,
		question: `${nomArticle} ${nomForm} → ${grammaticalCase.toUpperCase()} ${numLabel}?`,
		hint: noun.meaning,
		answer: `${article} ${form}`,
		details: buildNounTable(noun),
	};
}

export function generateNounCards(
	nouns: Noun[],
	batchSize: number,
	excludeWords: string[] = [],
): Card[] {
	const excluded = new Set(excludeWords);
	const filtered = excluded.size > 0 ? nouns.filter((n) => !excluded.has(n.word)) : nouns;
	const cards: Card[] = [];

	for (const noun of filtered) {
		cards.push(genderCard(noun));
		cards.push(pluralCard(noun));

		for (const c of CASES) {
			if (c === "nom") continue;
			cards.push(declensionCard(noun, c, "singular"));
		}
		cards.push(declensionCard(noun, "dat", "plural"));
	}

	return shuffle(cards).slice(0, batchSize);
}
