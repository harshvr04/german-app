import { declineNoun } from "../engine/noun-declension.js";
import type { Noun } from "../schemas/index.js";
import type { Card, Case, GrammaticalNumber } from "../types/german.js";
import { shuffle } from "./shuffle.js";

const ARTICLE_MAP = { m: "der", f: "die", n: "das" } as const;
const CASES: Case[] = ["nom", "acc", "dat", "gen"];

function genderCard(noun: Noun): Card {
	return {
		id: `noun-gender-${noun.word}`,
		question: `der / die / das ${noun.word}?`,
		answer: `${ARTICLE_MAP[noun.gender]} ${noun.word}`,
	};
}

function pluralCard(noun: Noun): Card {
	const { noun: pluralForm } = declineNoun(noun, "nom", "plural");
	return {
		id: `noun-plural-${noun.word}`,
		question: `Plural von ${noun.word}?`,
		answer: `die ${pluralForm}`,
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
		answer: `${article} ${form}`,
	};
}

export function generateNounCards(nouns: Noun[], batchSize: number): Card[] {
	const cards: Card[] = [];

	for (const noun of nouns) {
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
