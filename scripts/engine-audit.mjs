/**
 * Engine audit script: generates random card outputs across all categories
 * and prints them for LLM verification.
 *
 * Usage:
 *   node scripts/engine-audit.mjs [--level A1|A2|B1] [--count 50]
 *
 * Defaults: level=A1, count=50
 * Extensible for future Goethe levels (A2, B1, B2, C1, C2).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DATA_DIR = resolve(import.meta.dirname, "../assets/data");

// ── Parse CLI args ─────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name, fallback) {
	const idx = args.indexOf(`--${name}`);
	return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}
const level = getArg("level", "A1");
const totalCount = Number(getArg("count", "50"));

// ── Load & filter data by level ────────────────────────────────────
function loadAndFilter(file) {
	const data = JSON.parse(readFileSync(resolve(DATA_DIR, file), "utf-8"));
	return data.filter((entry) => entry.level === level);
}

const nouns = loadAndFilter("nouns.json");
const verbs = loadAndFilter("verbs.json");
const adjectives = loadAndFilter("adjectives.json");
const others = loadAndFilter("others.json");

console.log(
	`Level: ${level} | Nouns: ${nouns.length} | Verbs: ${verbs.length} | Adjectives: ${adjectives.length} | Others: ${others.length}\n`,
);

// ── Import engines ─────────────────────────────────────────────────
const {
	declineNoun,
	getArticle,
	declineAdjective,
	conjugatePresent,
	conjugatePraeteritum,
	conjugatePerfekt,
	conjugateKonjunktivII,
} = await import("../packages/core/dist/engine/index.js");

// ── Helpers ────────────────────────────────────────────────────────
function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}
function pickN(arr, n) {
	const shuffled = [...arr].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, Math.min(n, shuffled.length));
}

const PERSONS = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];
const CASES = ["nom", "acc", "dat", "gen"];
const NUMBERS = ["singular", "plural"];
const PARADIGMS = ["no_article", "definite", "indefinite_possessive_or_kein"];
const GENDERS_PL = ["m", "f", "n", "pl"];

// ── Distribute count across categories ─────────────────────────────
const nounCount = Math.round(totalCount * 0.3);
const verbCount = Math.round(totalCount * 0.3);
const adjCount = Math.round(totalCount * 0.2);
const compCount = Math.round(totalCount * 0.1);
const otherCount = totalCount - nounCount - verbCount - adjCount - compCount;

// ── 1. Noun declension ─────────────────────────────────────────────
console.log(`=== NOUN DECLENSION (${nounCount} tests) ===\n`);
for (const noun of pickN(nouns, nounCount)) {
	const c = pick(CASES);
	const num = pick(NUMBERS);
	const result = declineNoun(noun, c, num);
	console.log(
		`${noun.word} (${noun.gender}, plural: ${noun.plural_suffix}, n-dekl: ${noun.is_n_dekl}) → ${c} ${num} → "${result.article} ${result.noun}"`,
	);
}

// ── 2. Verb conjugation ────────────────────────────────────────────
const tenses = [
	{ name: "Präsens", fn: conjugatePresent },
	{ name: "Präteritum", fn: conjugatePraeteritum },
	{ name: "Perfekt", fn: conjugatePerfekt },
	{ name: "Konjunktiv II", fn: conjugateKonjunktivII },
];
console.log(`\n=== VERB CONJUGATION (${verbCount} tests) ===\n`);
for (const verb of pickN(verbs, verbCount)) {
	const person = pick(PERSONS);
	const tense = pick(tenses);
	const result = tense.fn(verb, person);
	console.log(
		`${verb.infinitiv} (${verb.type}, aux: ${verb.auxiliary}) → ${person} / ${tense.name} → "${result}"`,
	);
}

// ── 3. Adjective declension ────────────────────────────────────────
const declinableAdjs = adjectives.filter((a) => a.is_declinable);
console.log(`\n=== ADJECTIVE DECLENSION (${adjCount} tests) ===\n`);
for (const adj of pickN(declinableAdjs, adjCount)) {
	const paradigm = pick(PARADIGMS);
	const c = pick(CASES);
	const g = pick(GENDERS_PL);
	const result = declineAdjective(adj.word, paradigm, c, g);
	console.log(`${adj.word} → ${paradigm} / ${c} / ${g} → "${result}"`);
}

// ── 4. Adjective comparison (only comparable adjectives) ──────────
const comparableAdjs = adjectives.filter((a) => a.is_comparable);
console.log(
	`\n=== ADJECTIVE COMPARISON (${compCount} tests, from ${comparableAdjs.length} comparable) ===\n`,
);
for (const adj of pickN(comparableAdjs, compCount)) {
	const komp = adj.komparativ ?? `${adj.word}er`;
	const sup = adj.superlativ ? `am ${adj.superlativ}` : `am ${adj.word}sten`;
	console.log(`${adj.word} → Komparativ: "${komp}" / Superlativ: "${sup}"`);
}

// ── 5. Others / Vocab ──────────────────────────────────────────────
console.log(`\n=== OTHERS / VOCAB (${otherCount} tests) ===\n`);
for (const o of pickN(others, otherCount)) {
	console.log(`${o.word} → "${o.meaning}"`);
}

console.log(`\n=== TOTAL: ${totalCount} tests generated (level: ${level}) ===`);
