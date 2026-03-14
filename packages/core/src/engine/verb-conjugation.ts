import type { Verb } from "../schemas/index.js";
import type { Person } from "../types/german.js";

const INSEPARABLE_PREFIXES = ["be", "emp", "ent", "er", "ge", "hinter", "miss", "ver", "zer"];

/**
 * Strips "sich " prefix from reflexive verb infinitives.
 */
function getBaseInfinitiv(verb: Verb): string {
	return verb.infinitiv.startsWith("sich ") ? verb.infinitiv.slice(5) : verb.infinitiv;
}

const REFLEXIVE_PRONOUNS: Record<Person, string> = {
	ich: "mich",
	du: "dich",
	"er/sie/es": "sich",
	wir: "uns",
	ihr: "euch",
	"sie/Sie": "sich",
};

/**
 * Inserts the reflexive pronoun into a conjugated form.
 * Simple tenses (no spaces): appended — "ausruhe" → "ausruhe mich"
 * Compound tenses (spaces): after first word — "habe ausgeruht" → "habe mich ausgeruht"
 */
function insertReflexive(verb: Verb, person: Person, form: string): string {
	if (!verb.infinitiv.startsWith("sich ")) return form;
	const pronoun = REFLEXIVE_PRONOUNS[person];
	const spaceIdx = form.indexOf(" ");
	if (spaceIdx !== -1) {
		return `${form.slice(0, spaceIdx)} ${pronoun} ${form.slice(spaceIdx + 1)}`;
	}
	return `${form} ${pronoun}`;
}

/**
 * Returns the separable prefix of a verb, or null if the verb is not separable.
 */
export function getSeparablePrefix(verb: Verb): string | null {
	const pp = verb.partizip_ii;
	const inf = getBaseInfinitiv(verb);

	// Search from the end so longer prefixes (e.g. "entgegen") win over
	// shorter false matches (e.g. "entge" from the first "ge" in "entgegengekommen").
	let searchFrom = pp.length - 3;
	while (searchFrom >= 1) {
		const geIdx = pp.lastIndexOf("ge", searchFrom);
		if (geIdx <= 0) break;

		const prefix = pp.slice(0, geIdx);
		const baseVerb = inf.slice(prefix.length);
		const basePartizip = pp.slice(geIdx + 2);
		if (
			!INSEPARABLE_PREFIXES.includes(prefix) &&
			inf.startsWith(prefix) &&
			baseVerb.length > 3 &&
			basePartizip.length >= 3 &&
			/(?:en|eln|ern)$/.test(baseVerb)
		) {
			return prefix;
		}

		searchFrom = geIdx - 1;
	}

	return null;
}

export function formatSeparableVerb(verb: Verb): string {
	const prefix = getSeparablePrefix(verb);
	const baseInf = getBaseInfinitiv(verb);
	const sichPrefix = verb.infinitiv.startsWith("sich ") ? "sich " : "";
	if (!prefix) return verb.infinitiv;
	return `${sichPrefix}${prefix}|${baseInf.slice(prefix.length)}`;
}

/**
 * Inserts "|" after the separable prefix in a conjugated form.
 * E.g. for "abfahren": "abfahre" → "ab|fahre", "werde abfahren" → "werde ab|fahren"
 * Skips compound tenses where the partizip is used (Perfekt/Plusquamperfekt)
 * since the prefix stays attached there ("habe abgefahren" stays as-is).
 * Non-separable verbs are returned unchanged.
 */
export function formatConjugatedForm(verb: Verb, conjugated: string): string {
	const prefix = getSeparablePrefix(verb);
	if (!prefix) return conjugated;

	const baseInf = getBaseInfinitiv(verb);

	// Skip compound tenses where the prefix doesn't separate:
	// Perfekt/Plusquamperfekt (contains partizip II) and Futur I/Konj II (helper + infinitive)
	const words = conjugated.split(" ");
	if (words.includes(verb.partizip_ii)) {
		return conjugated;
	}
	// In compound tenses the infinitive appears after a helper verb (not first word).
	// In simple tenses the conjugated form may coincidentally match the infinitive
	// (e.g. wir ausruhen) but it will be the first word — still needs "|".
	const infIdx = words.indexOf(baseInf);
	if (infIdx > 0) {
		return conjugated;
	}

	return words
		.map((word) => {
			if (word.startsWith(prefix) && word.length > prefix.length) {
				return `${prefix}|${word.slice(prefix.length)}`;
			}
			return word;
		})
		.join(" ");
}

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

const KONJUNKTIV_I_ENDINGS: Record<Person, string> = {
	ich: "e",
	du: "est",
	"er/sie/es": "e",
	wir: "en",
	ihr: "et",
	"sie/Sie": "en",
};

const SEIN_KONJUNKTIV_I: Record<Person, string> = {
	ich: "sei",
	du: "seist",
	"er/sie/es": "sei",
	wir: "seien",
	ihr: "seiet",
	"sie/Sie": "seien",
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

const WERDEN_PRESENT: Record<Person, string> = {
	ich: "werde",
	du: "wirst",
	"er/sie/es": "wird",
	wir: "werden",
	ihr: "werdet",
	"sie/Sie": "werden",
};

const WERDEN_KONJUNKTIV_II: Record<Person, string> = {
	ich: "würde",
	du: "würdest",
	"er/sie/es": "würde",
	wir: "würden",
	ihr: "würdet",
	"sie/Sie": "würden",
};

const HABEN_PRAETERITUM: Record<Person, string> = {
	ich: "hatte",
	du: "hattest",
	"er/sie/es": "hatte",
	wir: "hatten",
	ihr: "hattet",
	"sie/Sie": "hatten",
};

const SEIN_PRAETERITUM: Record<Person, string> = {
	ich: "war",
	du: "warst",
	"er/sie/es": "war",
	wir: "waren",
	ihr: "wart",
	"sie/Sie": "waren",
};

const WERDEN_PRAETERITUM: Record<Person, string> = {
	ich: "wurde",
	du: "wurdest",
	"er/sie/es": "wurde",
	wir: "wurden",
	ihr: "wurdet",
	"sie/Sie": "wurden",
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
		return insertReflexive(verb, person, verb.present_forms[person]);
	}

	let stem = extractStem(getBaseInfinitiv(verb));

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

	return insertReflexive(verb, person, stem + ending);
}

export function conjugatePraeteritum(verb: Verb, person: Person): string {
	if (verb.infinitiv === "werden") return WERDEN_PRAETERITUM[person];

	const root = verb.praeteritum_root;

	if (verb.type === "irregular") {
		return insertReflexive(verb, person, root + PRAETERITUM_IRREGULAR_ENDINGS[person]);
	}

	return insertReflexive(verb, person, root + PRAETERITUM_REGULAR_ENDINGS[person]);
}

export function conjugatePerfekt(verb: Verb, person: Person): string {
	const auxForms = verb.auxiliary === "haben" ? HABEN_PRESENT : SEIN_PRESENT;
	return insertReflexive(verb, person, `${auxForms[person]} ${verb.partizip_ii}`);
}

export function conjugateKonjunktivII(verb: Verb, person: Person): string {
	if (verb.infinitiv === "werden") return WERDEN_KONJUNKTIV_II[person];

	const baseInf = getBaseInfinitiv(verb);

	if (verb.type === "regular") {
		return insertReflexive(verb, person, `${WERDEN_KONJUNKTIV_II[person]} ${baseInf}`);
	}

	const root = verb.konjunktiv_ii_root ?? verb.praeteritum_root;

	if (verb.type === "mixed") {
		return insertReflexive(verb, person, root + PRAETERITUM_REGULAR_ENDINGS[person]);
	}

	return insertReflexive(verb, person, root + KONJUNKTIV_II_ENDINGS[person]);
}

export function conjugateFuturI(verb: Verb, person: Person): string {
	const baseInf = getBaseInfinitiv(verb);
	return insertReflexive(verb, person, `${WERDEN_PRESENT[person]} ${baseInf}`);
}

export function conjugatePlusquamperfekt(verb: Verb, person: Person): string {
	const auxForms = verb.auxiliary === "haben" ? HABEN_PRAETERITUM : SEIN_PRAETERITUM;
	return insertReflexive(verb, person, `${auxForms[person]} ${verb.partizip_ii}`);
}

export function conjugateKonjunktivI(verb: Verb, person: Person): string {
	const baseInf = getBaseInfinitiv(verb);
	if (baseInf === "sein") {
		return SEIN_KONJUNKTIV_I[person];
	}
	const stem = extractStem(baseInf);
	return insertReflexive(verb, person, stem + KONJUNKTIV_I_ENDINGS[person]);
}
