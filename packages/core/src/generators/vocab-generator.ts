import type { Adjective, Noun, Other, Verb } from "../schemas/index.js";
import type { Card, VocabDirection } from "../types/german.js";
import { shuffle } from "./shuffle.js";
import { adjCard, nounCard, otherCard, verbCard } from "./vocab-cards.js";

export function generateVocabCards(
	nouns: Noun[],
	verbs: Verb[],
	adjectives: Adjective[],
	batchSize: number,
	direction: VocabDirection,
	others: Other[] = [],
	excludeWords: string[] = [],
	encounteredWords: string[] = [],
): Card[] {
	const excluded = new Set(excludeWords);
	const fNouns = excluded.size > 0 ? nouns.filter((n) => !excluded.has(n.word)) : nouns;
	const fVerbs = excluded.size > 0 ? verbs.filter((v) => !excluded.has(v.infinitiv)) : verbs;
	const fAdjs = excluded.size > 0 ? adjectives.filter((a) => !excluded.has(a.word)) : adjectives;
	const fOthers = excluded.size > 0 ? others.filter((o) => !excluded.has(o.word)) : others;

	const all: Card[] = [
		...fNouns.map((n) => nounCard(n, direction)),
		...fVerbs.map((v) => verbCard(v, direction)),
		...fAdjs.map((a) => adjCard(a, direction)),
		...fOthers.map((o) => otherCard(o, direction)),
	];

	const totalWords = nouns.length + verbs.length + adjectives.length + others.length;
	const encountered = new Set(encounteredWords);

	// At 90%+ coverage, put unseen words first so they're picked preferentially
	if (totalWords > 0 && encountered.size / totalWords >= 0.9 && encountered.size < totalWords) {
		const unseen: Card[] = [];
		const seen: Card[] = [];
		for (const c of all) {
			const word = c.id.split("-").slice(3).join("-");
			(encountered.has(word) ? seen : unseen).push(c);
		}
		return [...shuffle(unseen), ...shuffle(seen)].slice(0, batchSize);
	}

	return shuffle(all).slice(0, batchSize);
}
