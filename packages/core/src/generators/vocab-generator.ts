import type { Adjective, Noun, Verb } from "../schemas/index.js";
import type { Card, VocabDirection } from "../types/german.js";
import { shuffle } from "./shuffle.js";

const ARTICLE_MAP = { m: "der", f: "die", n: "das" } as const;

function nounCard(noun: Noun, direction: VocabDirection): Card {
	const article = ARTICLE_MAP[noun.gender];
	if (direction === "de_to_en") {
		return {
			id: `vocab-noun-de-${noun.word}`,
			question: `${article} ${noun.word}`,
			answer: noun.meaning,
		};
	}
	return {
		id: `vocab-noun-en-${noun.word}`,
		question: noun.meaning,
		answer: `${article} ${noun.word}`,
		hint: "Include the article",
	};
}

function verbCard(verb: Verb, direction: VocabDirection): Card {
	if (direction === "de_to_en") {
		return {
			id: `vocab-verb-de-${verb.infinitiv}`,
			question: verb.infinitiv,
			answer: verb.meaning,
		};
	}
	return {
		id: `vocab-verb-en-${verb.infinitiv}`,
		question: verb.meaning,
		answer: verb.infinitiv,
	};
}

function adjCard(adj: Adjective, direction: VocabDirection): Card {
	if (direction === "de_to_en") {
		return {
			id: `vocab-adj-de-${adj.word}`,
			question: adj.word,
			answer: adj.meaning,
		};
	}
	return {
		id: `vocab-adj-en-${adj.word}`,
		question: adj.meaning,
		answer: adj.word,
	};
}

export function generateVocabCards(
	nouns: Noun[],
	verbs: Verb[],
	adjectives: Adjective[],
	batchSize: number,
	direction: VocabDirection,
): Card[] {
	const all: Card[] = [
		...nouns.map((n) => nounCard(n, direction)),
		...verbs.map((v) => verbCard(v, direction)),
		...adjectives.map((a) => adjCard(a, direction)),
	];
	return shuffle(all).slice(0, batchSize);
}
