import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { AdjectiveSchema, NounSchema, VerbSchema } from "../schemas/index.js";
import type { Adjective, Noun, Verb } from "../schemas/index.js";
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

export function loadVerbs(dataDir: string, level: Level): Verb[] {
	const filePath = resolve(dataDir, "verbs.json");
	return filterByLevel(loadAndParse(filePath, VerbSchema), level);
}

export function loadAdjectives(dataDir: string, level: Level): Adjective[] {
	const filePath = resolve(dataDir, "adjectives.json");
	return filterByLevel(loadAndParse(filePath, AdjectiveSchema), level);
}
