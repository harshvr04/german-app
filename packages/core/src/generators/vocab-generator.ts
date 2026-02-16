import type { Adjective, Noun, Verb } from "../schemas/index.js";
import type { Card } from "../types/german.js";
import { shuffle } from "./shuffle.js";

const ARTICLE_MAP = { m: "der", f: "die", n: "das" } as const;

function nounToCards(noun: Noun): Card[] {
	const article = ARTICLE_MAP[noun.gender];
	return [
		{
			id: `vocab-noun-de-${noun.word}`,
			question: `${article} ${noun.word}`,
			answer: noun.meaning,
		},
		{
			id: `vocab-noun-en-${noun.word}`,
			question: noun.meaning,
			answer: `${article} ${noun.word}`,
			hint: "Include the article",
		},
	];
}

function verbToCards(verb: Verb): Card[] {
	return [
		{
			id: `vocab-verb-de-${verb.infinitiv}`,
			question: verb.infinitiv,
			answer: verb.meaning,
		},
		{
			id: `vocab-verb-en-${verb.infinitiv}`,
			question: verb.meaning,
			answer: verb.infinitiv,
		},
	];
}

function adjToCards(adj: Adjective): Card[] {
	return [
		{
			id: `vocab-adj-de-${adj.word}`,
			question: adj.word,
			answer: adj.meaning,
		},
		{
			id: `vocab-adj-en-${adj.word}`,
			question: adj.meaning,
			answer: adj.word,
		},
	];
}

export function generateVocabCards(
	nouns: Noun[],
	verbs: Verb[],
	adjectives: Adjective[],
	batchSize: number,
): Card[] {
	const all: Card[] = [
		...nouns.flatMap(nounToCards),
		...verbs.flatMap(verbToCards),
		...adjectives.flatMap(adjToCards),
	];
	return shuffle(all).slice(0, batchSize);
}
