import {
	conjugateKonjunktivII,
	conjugatePerfekt,
	conjugatePraeteritum,
	conjugatePresent,
} from "../engine/verb-conjugation.js";
import type { Verb } from "../schemas/index.js";
import type { Card, Person } from "../types/german.js";
import { shuffle } from "./shuffle.js";

const PERSONS: Person[] = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];

function randomPerson(): Person {
	return PERSONS[Math.floor(Math.random() * PERSONS.length)]!;
}

function presentCard(verb: Verb): Card {
	const person = randomPerson();
	return {
		id: `verb-pres-${verb.infinitiv}-${person}`,
		question: `${person} (${verb.infinitiv}, Präsens)?`,
		answer: `${person} ${conjugatePresent(verb, person)}`,
	};
}

function praeteritumCard(verb: Verb): Card {
	const person = randomPerson();
	return {
		id: `verb-praet-${verb.infinitiv}-${person}`,
		question: `${person} (${verb.infinitiv}, Präteritum)?`,
		answer: `${person} ${conjugatePraeteritum(verb, person)}`,
	};
}

function perfektCard(verb: Verb): Card {
	const person = randomPerson();
	return {
		id: `verb-perfekt-${verb.infinitiv}-${person}`,
		question: `${person} (${verb.infinitiv}, Perfekt)?`,
		answer: `${person} ${conjugatePerfekt(verb, person)}`,
	};
}

function konjunktivIICard(verb: Verb): Card {
	const person = randomPerson();
	return {
		id: `verb-konj2-${verb.infinitiv}-${person}`,
		question: `${person} (${verb.infinitiv}, Konjunktiv II)?`,
		answer: `${person} ${conjugateKonjunktivII(verb, person)}`,
	};
}

export function generateVerbCards(verbs: Verb[], batchSize: number): Card[] {
	const cards: Card[] = [];

	for (const verb of verbs) {
		cards.push(presentCard(verb));
		cards.push(praeteritumCard(verb));
		cards.push(perfektCard(verb));
		cards.push(konjunktivIICard(verb));
	}

	return shuffle(cards).slice(0, batchSize);
}
