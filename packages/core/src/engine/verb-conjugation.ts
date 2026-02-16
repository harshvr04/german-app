import type { Verb } from "../schemas/index.js";
import type { Person } from "../types/german.js";

const PRESENT_ENDINGS: Record<Person, string> = {
	ich: "e",
	du: "st",
	"er/sie/es": "t",
	wir: "en",
	ihr: "t",
	"sie/Sie": "en",
};

const PRAETERITUM_REGULAR_ENDINGS: Record<Person, string> = {
	ich: "te",
	du: "test",
	"er/sie/es": "te",
	wir: "ten",
	ihr: "tet",
	"sie/Sie": "ten",
};

const PRAETERITUM_IRREGULAR_ENDINGS: Record<Person, string> = {
	ich: "",
	du: "st",
	"er/sie/es": "",
	wir: "en",
	ihr: "t",
	"sie/Sie": "en",
};

const KONJUNKTIV_II_ENDINGS: Record<Person, string> = {
	ich: "e",
	du: "est",
	"er/sie/es": "e",
	wir: "en",
	ihr: "et",
	"sie/Sie": "en",
};

const HABEN_PRESENT: Record<Person, string> = {
	ich: "habe",
	du: "hast",
	"er/sie/es": "hat",
	wir: "haben",
	ihr: "habt",
	"sie/Sie": "haben",
};

const SEIN_PRESENT: Record<Person, string> = {
	ich: "bin",
	du: "bist",
	"er/sie/es": "ist",
	wir: "sind",
	ihr: "seid",
	"sie/Sie": "sind",
};

const WERDEN_KONJUNKTIV_II: Record<Person, string> = {
	ich: "würde",
	du: "würdest",
	"er/sie/es": "würde",
	wir: "würden",
	ihr: "würdet",
	"sie/Sie": "würden",
};

function extractStem(infinitiv: string): string {
	if (infinitiv.endsWith("eln") || infinitiv.endsWith("ern")) {
		return infinitiv.slice(0, -3);
	}
	if (infinitiv.endsWith("en")) return infinitiv.slice(0, -2);
	if (infinitiv.endsWith("n")) return infinitiv.slice(0, -1);
	return infinitiv;
}

function stemEndsInTD(stem: string): boolean {
	return /[td]$/.test(stem);
}

function stemEndsInSibilant(stem: string): boolean {
	return /[sßzx]$/.test(stem);
}

function applyStemChange(stem: string, change: string): string {
	const [from, to] = change.split("→").map((s) => s.trim());
	if (!from || !to) return stem;
	const idx = stem.lastIndexOf(from);
	if (idx === -1) return stem;
	return stem.slice(0, idx) + to + stem.slice(idx + from.length);
}

export function conjugatePresent(verb: Verb, person: Person): string {
	if (verb.present_forms) {
		return verb.present_forms[person];
	}

	let stem = extractStem(verb.infinitiv);

	if (verb.stem_change_pres && (person === "du" || person === "er/sie/es")) {
		stem = applyStemChange(stem, verb.stem_change_pres);
	}

	let ending = PRESENT_ENDINGS[person];

	if (stemEndsInTD(stem)) {
		if (person === "du" || person === "er/sie/es" || person === "ihr") {
			ending = `e${ending}`;
		}
	} else if (stemEndsInSibilant(stem) && person === "du") {
		ending = "t";
	}

	return stem + ending;
}

export function conjugatePraeteritum(verb: Verb, person: Person): string {
	const root = verb.praeteritum_root;

	if (verb.type === "irregular") {
		return root + PRAETERITUM_IRREGULAR_ENDINGS[person];
	}

	return root + PRAETERITUM_REGULAR_ENDINGS[person];
}

export function conjugatePerfekt(verb: Verb, person: Person): string {
	const auxForms = verb.auxiliary === "haben" ? HABEN_PRESENT : SEIN_PRESENT;
	return `${auxForms[person]} ${verb.partizip_ii}`;
}

export function conjugateKonjunktivII(verb: Verb, person: Person): string {
	if (verb.type === "regular") {
		return `${WERDEN_KONJUNKTIV_II[person]} ${verb.infinitiv}`;
	}

	const root = verb.konjunktiv_ii_root ?? verb.praeteritum_root;

	if (verb.type === "mixed") {
		return root + PRAETERITUM_REGULAR_ENDINGS[person];
	}

	return root + KONJUNKTIV_II_ENDINGS[person];
}
