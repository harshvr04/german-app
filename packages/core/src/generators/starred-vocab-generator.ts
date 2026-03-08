import type { Adjective, Noun, Other, Verb } from "../schemas/index.js";
import type { StarredWord } from "../session/starred.js";
import type { Card, Level, VocabDirection } from "../types/german.js";
import { shuffle } from "./shuffle.js";
import { adjCard, nounCard, otherCard, verbCard } from "./vocab-cards.js";

export interface LevelWordData {
	nouns: Noun[];
	verbs: Verb[];
	adjectives: Adjective[];
	others: Other[];
}

export function generateStarredVocabCards(
	starredWords: StarredWord[],
	dataByLevel: Map<Level, LevelWordData>,
	direction: VocabDirection,
): Card[] {
	const cards: Card[] = [];
	for (const { word, level } of starredWords) {
		const data = dataByLevel.get(level);
		if (!data) continue;

		let card: Card | undefined;
		const noun = data.nouns.find((n) => n.word === word);
		if (noun) {
			card = nounCard(noun, direction);
		}
		if (!card) {
			const verb = data.verbs.find((v) => v.infinitiv === word);
			if (verb) card = verbCard(verb, direction);
		}
		if (!card) {
			const adj = data.adjectives.find((a) => a.word === word);
			if (adj) card = adjCard(adj, direction);
		}
		if (!card) {
			const other = data.others.find((o) => o.word === word);
			if (other) card = otherCard(other, direction);
		}
		if (card) {
			card.level = level;
			cards.push(card);
		}
	}
	return shuffle(cards);
}
