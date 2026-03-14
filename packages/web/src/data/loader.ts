import { AdjectiveSchema, NounSchema, OtherSchema, VerbSchema } from "@german/core/schemas";
import type { Level } from "@german/core/types";
import { LEVELS } from "@german/core/types";
import { z } from "zod";

import adjectivesData from "../../../../assets/data/adjectives.json";
import nounsData from "../../../../assets/data/nouns.json";
import othersData from "../../../../assets/data/others.json";
import verbsData from "../../../../assets/data/verbs.json";

function filterByLevel<T extends { level: string }>(items: T[], level: Level): T[] {
	return items.filter((item) => item.level === level);
}

const parsedNouns = z.array(NounSchema).parse(nounsData);
const parsedVerbs = z.array(VerbSchema).parse(verbsData);
const parsedAdjectives = z.array(AdjectiveSchema).parse(adjectivesData);
const parsedOthers = z.array(OtherSchema).parse(othersData);

export function loadNouns(level: Level) {
	return filterByLevel(parsedNouns, level);
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

export function loadVerbs(level: Level) {
	return filterByLevel(parsedVerbs, level);
}

/** Cumulative verb loading for exercises: A2 includes A1, B1 includes A1+A2, etc. Core verbs always included. */
export function loadVerbsForExercise(level: Level) {
	const levelIdx = LEVELS.indexOf(level);
	const included = new Set(LEVELS.slice(0, levelIdx + 1));
	return parsedVerbs.filter((v) => included.has(v.level as Level) || CORE_VERBS.has(v.infinitiv));
}

export function loadAdjectives(level: Level) {
	return filterByLevel(parsedAdjectives, level);
}

export function loadOthers(level: Level) {
	return filterByLevel(parsedOthers, level);
}

export function getTotalWordCount(level: Level): number {
	return (
		loadNouns(level).length +
		loadVerbs(level).length +
		loadAdjectives(level).length +
		loadOthers(level).length
	);
}

/** Returns true if there is any data for this level across all categories. */
export function hasDataForLevel(level: Level): boolean {
	return (
		parsedNouns.some((n) => n.level === level) ||
		parsedVerbs.some((v) => v.level === level) ||
		parsedAdjectives.some((a) => a.level === level) ||
		parsedOthers.some((o) => o.level === level)
	);
}
