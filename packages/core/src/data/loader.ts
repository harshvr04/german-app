import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { AdjectiveSchema, NounSchema, OtherSchema, VerbSchema } from "../schemas/index.js";
import type { Adjective, Noun, Other, Verb } from "../schemas/index.js";
import { LEVELS } from "../types/german.js";
import type { Level } from "../types/german.js";

function loadAndParse<T>(filePath: string, schema: z.ZodType<T>): T[] {
	const raw = readFileSync(filePath, "utf-8");
	const parsed = JSON.parse(raw) as unknown;
	const array = z.array(schema).parse(parsed);
	return array;
}

function filterByLevel<T extends { level: string }>(items: T[], level: Level): T[] {
	return items.filter((item) => item.level === level);
}

export function loadNouns(dataDir: string, level: Level): Noun[] {
	const filePath = resolve(dataDir, "nouns.json");
	return filterByLevel(loadAndParse(filePath, NounSchema), level);
}

const CORE_VERBS = new Set([
	"haben",
	"sein",
	"werden",
	"können",
	"müssen",
	"sollen",
	"wollen",
	"dürfen",
	"mögen",
]);

export function loadVerbs(dataDir: string, level: Level): Verb[] {
	const filePath = resolve(dataDir, "verbs.json");
	return filterByLevel(loadAndParse(filePath, VerbSchema), level);
}

/** Cumulative verb loading for exercises: A2 includes A1, B1 includes A1+A2, etc. Core verbs always included. */
export function loadVerbsForExercise(dataDir: string, level: Level): Verb[] {
	const filePath = resolve(dataDir, "verbs.json");
	const all = loadAndParse(filePath, VerbSchema);
	const levelIdx = LEVELS.indexOf(level);
	const included = new Set(LEVELS.slice(0, levelIdx + 1));
	return all.filter((v) => included.has(v.level as Level) || CORE_VERBS.has(v.infinitiv));
}

export function loadAdjectives(dataDir: string, level: Level): Adjective[] {
	const filePath = resolve(dataDir, "adjectives.json");
	return filterByLevel(loadAndParse(filePath, AdjectiveSchema), level);
}

export function loadOthers(dataDir: string, level: Level): Other[] {
	const filePath = resolve(dataDir, "others.json");
	return filterByLevel(loadAndParse(filePath, OtherSchema), level);
}

export function getTotalWordCount(dataDir: string, level: Level): number {
	return (
		loadNouns(dataDir, level).length +
		loadVerbs(dataDir, level).length +
		loadAdjectives(dataDir, level).length +
		loadOthers(dataDir, level).length
	);
}
