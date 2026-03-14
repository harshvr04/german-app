import {
	conjugateFuturI,
	conjugateKonjunktivI,
	conjugateKonjunktivII,
	conjugatePerfekt,
	conjugatePlusquamperfekt,
	conjugatePraeteritum,
	conjugatePresent,
	formatConjugatedForm,
	formatSeparableVerb,
} from "../engine/verb-conjugation.js";
import type { Verb } from "../schemas/index.js";
import type { Card, Level, Person } from "../types/german.js";
import { shuffle } from "./shuffle.js";

const PERSONS: Person[] = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];

function randomPerson(): Person {
	return PERSONS[Math.floor(Math.random() * PERSONS.length)] as Person;
}

type ConjugationFn = (verb: Verb, person: Person) => string;

function buildConjugationTable(verb: Verb, tense: string, conjugate: ConjugationFn): string {
	const header = `${formatSeparableVerb(verb)} (${tense})`;
	const rows = PERSONS.map((p) => `${p} ${formatConjugatedForm(verb, conjugate(verb, p))}`).join(
		"\n",
	);
	return `${header}\n${rows}`;
}

function presentCard(verb: Verb): Card {
	const person = randomPerson();
	return {
		id: `verb-pres-${verb.infinitiv}-${person}`,
		question: `${person} (${formatSeparableVerb(verb)}, Präsens)?`,
		hint: verb.meaning,
		answer: `${person} ${formatConjugatedForm(verb, conjugatePresent(verb, person))}`,
		details: buildConjugationTable(verb, "Präsens", conjugatePresent),
	};
}

function perfektCard(verb: Verb): Card {
	const person = randomPerson();
	return {
		id: `verb-perfekt-${verb.infinitiv}-${person}`,
		question: `${person} (${formatSeparableVerb(verb)}, Perfekt)?`,
		hint: verb.meaning,
		answer: `${person} ${formatConjugatedForm(verb, conjugatePerfekt(verb, person))}`,
		details: buildConjugationTable(verb, "Perfekt", conjugatePerfekt),
	};
}

function praeteritumCard(verb: Verb): Card {
	const person = randomPerson();
	return {
		id: `verb-praet-${verb.infinitiv}-${person}`,
		question: `${person} (${formatSeparableVerb(verb)}, Präteritum)?`,
		hint: verb.meaning,
		answer: `${person} ${formatConjugatedForm(verb, conjugatePraeteritum(verb, person))}`,
		details: buildConjugationTable(verb, "Präteritum", conjugatePraeteritum),
	};
}

function futurICard(verb: Verb): Card {
	const person = randomPerson();
	return {
		id: `verb-futur1-${verb.infinitiv}-${person}`,
		question: `${person} (${formatSeparableVerb(verb)}, Futur I)?`,
		hint: verb.meaning,
		answer: `${person} ${formatConjugatedForm(verb, conjugateFuturI(verb, person))}`,
		details: buildConjugationTable(verb, "Futur I", conjugateFuturI),
	};
}

function plusquamperfektCard(verb: Verb): Card {
	const person = randomPerson();
	return {
		id: `verb-plusq-${verb.infinitiv}-${person}`,
		question: `${person} (${formatSeparableVerb(verb)}, Plusquamperfekt)?`,
		hint: verb.meaning,
		answer: `${person} ${formatConjugatedForm(verb, conjugatePlusquamperfekt(verb, person))}`,
		details: buildConjugationTable(verb, "Plusquamperfekt", conjugatePlusquamperfekt),
	};
}

function konjunktivICard(verb: Verb): Card {
	const person = randomPerson();
	return {
		id: `verb-konj1-${verb.infinitiv}-${person}`,
		question: `${person} (${formatSeparableVerb(verb)}, Konjunktiv I)?`,
		hint: verb.meaning,
		answer: `${person} ${formatConjugatedForm(verb, conjugateKonjunktivI(verb, person))}`,
		details: buildConjugationTable(verb, "Konjunktiv I", conjugateKonjunktivI),
	};
}

function konjunktivIICard(verb: Verb): Card {
	const person = randomPerson();
	return {
		id: `verb-konj2-${verb.infinitiv}-${person}`,
		question: `${person} (${formatSeparableVerb(verb)}, Konjunktiv II)?`,
		hint: verb.meaning,
		answer: `${person} ${formatConjugatedForm(verb, conjugateKonjunktivII(verb, person))}`,
		details: buildConjugationTable(verb, "Konjunktiv II", conjugateKonjunktivII),
	};
}

function cardsForVerb(verb: Verb, level: Level): Card[] {
	const cards: Card[] = [];

	// A1: Präsens, Perfekt
	cards.push(presentCard(verb));
	cards.push(perfektCard(verb));

	if (level === "A1") return cards;

	// A2: + Futur I, Präteritum
	cards.push(futurICard(verb));
	cards.push(praeteritumCard(verb));

	if (level === "A2") return cards;

	// B1: + Plusquamperfekt, Konjunktiv II
	cards.push(plusquamperfektCard(verb));
	cards.push(konjunktivIICard(verb));

	if (level === "B1") return cards;

	// B2+: + Konjunktiv I
	cards.push(konjunktivICard(verb));

	return cards;
}

export function generateVerbCards(
	verbs: Verb[],
	batchSize: number,
	excludeWords: string[] = [],
	level: Level = "B1",
): Card[] {
	const excluded = new Set(excludeWords);
	const filtered = excluded.size > 0 ? verbs.filter((v) => !excluded.has(v.infinitiv)) : verbs;
	const cards: Card[] = [];

	for (const verb of filtered) {
		cards.push(...cardsForVerb(verb, level));
	}

	return shuffle(cards).slice(0, batchSize);
}
