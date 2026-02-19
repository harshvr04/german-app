import type { Adjective, Noun, Other, Verb } from "../schemas/index.js";
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
			hint: noun.example,
		};
	}
	return {
		id: `vocab-noun-en-${noun.word}`,
		question: noun.meaning,
		answer: `${article} ${noun.word}`,
		hint: "Include the article",
		example: noun.example,
	};
}

function verbCard(verb: Verb, direction: VocabDirection): Card {
	if (direction === "de_to_en") {
		return {
			id: `vocab-verb-de-${verb.infinitiv}`,
			question: verb.infinitiv,
			answer: verb.meaning,
			hint: verb.example,
		};
	}
	return {
		id: `vocab-verb-en-${verb.infinitiv}`,
		question: verb.meaning,
		answer: verb.infinitiv,
		example: verb.example,
	};
}

function adjCard(adj: Adjective, direction: VocabDirection): Card {
	if (direction === "de_to_en") {
		return {
			id: `vocab-adj-de-${adj.word}`,
			question: adj.word,
			answer: adj.meaning,
			hint: adj.example,
		};
	}
	return {
		id: `vocab-adj-en-${adj.word}`,
		question: adj.meaning,
		answer: adj.word,
		example: adj.example,
	};
}

function otherCard(other: Other, direction: VocabDirection): Card {
	if (direction === "de_to_en") {
		return {
			id: `vocab-other-de-${other.word}`,
			question: other.word,
			answer: other.meaning,
			hint: other.example,
		};
	}
	return {
		id: `vocab-other-en-${other.word}`,
		question: other.meaning,
		answer: other.word,
		example: other.example,
	};
}

export function generateVocabCards(
	nouns: Noun[],
	verbs: Verb[],
	adjectives: Adjective[],
	batchSize: number,
	direction: VocabDirection,
	others: Other[] = [],
): Card[] {
	const all: Card[] = [
		...nouns.map((n) => nounCard(n, direction)),
		...verbs.map((v) => verbCard(v, direction)),
		...adjectives.map((a) => adjCard(a, direction)),
		...others.map((o) => otherCard(o, direction)),
	];
	return shuffle(all).slice(0, batchSize);
}
