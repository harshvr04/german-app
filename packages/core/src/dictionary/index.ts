import type { Adjective, Noun, Other, Verb } from "../schemas/index.js";
import type { DictionaryEntry, Level } from "../types/german.js";

/**
 * Combines all word types into a sorted list of dictionary entries.
 * Verbs use `infinitiv` as the word field; all others use `word`.
 */
export function buildDictionary(
	nouns: Noun[],
	verbs: Verb[],
	adjectives: Adjective[],
	others: Other[],
): DictionaryEntry[] {
	const entries: DictionaryEntry[] = [
		...nouns.map((n) => ({
			word: n.word,
			meaning: n.meaning,
			example: n.example,
			level: n.level as Level,
		})),
		...verbs.map((v) => ({
			word: v.infinitiv,
			meaning: v.meaning,
			example: v.example,
			level: v.level as Level,
		})),
		...adjectives.map((a) => ({
			word: a.word,
			meaning: a.meaning,
			example: a.example,
			level: a.level as Level,
		})),
		...others.map((o) => ({
			word: o.word,
			meaning: o.meaning,
			example: o.example,
			level: o.level as Level,
		})),
	];

	entries.sort((a, b) => a.word.localeCompare(b.word, "de", { sensitivity: "base" }));

	return entries;
}

/** Filters dictionary entries by substring match on the word field only. */
export function filterDictionary(entries: DictionaryEntry[], query: string): DictionaryEntry[] {
	if (!query) return entries;
	const lower = query.toLowerCase();
	return entries.filter((e) => e.word.toLowerCase().includes(lower));
}

/**
 * Merges new entries into an existing sorted dictionary, maintaining sort order
 * and deduplicating by word.
 */
export function mergeDictionary(
	existing: DictionaryEntry[],
	incoming: DictionaryEntry[],
): DictionaryEntry[] {
	const seen = new Set(existing.map((e) => `${e.word}:${e.level}`));
	const merged = [...existing];
	for (const entry of incoming) {
		const key = `${entry.word}:${entry.level}`;
		if (!seen.has(key)) {
			seen.add(key);
			merged.push(entry);
		}
	}
	merged.sort((a, b) => a.word.localeCompare(b.word, "de", { sensitivity: "base" }));
	return merged;
}
