import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { AdjectiveSchema, NounSchema, OtherSchema, VerbSchema } from "@german/core/schemas";
import type { Level } from "@german/core/types";
import { LEVELS } from "@german/core/types";
import type { z } from "zod";
import { processBatches } from "./batch.js";
import { buildAdjectivePrompt } from "./prompts/adjective-prompt.js";
import { buildNounPrompt } from "./prompts/noun-prompt.js";
import { buildOtherPrompt } from "./prompts/other-prompt.js";
import { buildVerbPrompt } from "./prompts/verb-prompt.js";
import { mergeWithExisting, validateBatchResults } from "./validate.js";

type WordType = "nouns" | "verbs" | "adjectives" | "others";

const SCHEMA_MAP = {
	nouns: NounSchema,
	verbs: VerbSchema,
	adjectives: AdjectiveSchema,
	others: OtherSchema,
} as const;

const PROMPT_MAP = {
	nouns: buildNounPrompt,
	verbs: buildVerbPrompt,
	adjectives: buildAdjectivePrompt,
	others: buildOtherPrompt,
} as const;

const KEY_FIELD_MAP = {
	nouns: "word",
	verbs: "infinitiv",
	adjectives: "word",
	others: "word",
} as const;

function parseArgs(): {
	command: string;
	type: WordType;
	level: Level;
	input: string;
	output: string;
	batchSize: number;
	dryRun: boolean;
} {
	const args = process.argv.slice(2);
	const command = args[0] ?? "fill";

	let type: WordType = "nouns";
	let level: Level = "A1";
	let input = "";
	let output = "";
	let batchSize = 20;
	let dryRun = false;

	for (let i = 1; i < args.length; i++) {
		const arg = args[i];
		const next = args[i + 1];
		switch (arg) {
			case "--type":
				type = next as WordType;
				i++;
				break;
			case "--level":
				if (next && LEVELS.includes(next as Level)) {
					level = next as Level;
				}
				i++;
				break;
			case "--input":
				input = next ?? "";
				i++;
				break;
			case "--output":
				output = next ?? "";
				i++;
				break;
			case "--batch-size":
				batchSize = Number.parseInt(next ?? "20", 10);
				i++;
				break;
			case "--dry-run":
				dryRun = true;
				break;
		}
	}

	if (!output) {
		output = resolve(process.cwd(), `assets/data/${type}.json`);
	}

	return { command, type, level, input, output, batchSize, dryRun };
}

async function fill() {
	const { type, level, input, output, batchSize, dryRun } = parseArgs();

	if (!input) {
		console.error("Error: --input is required");
		process.exit(1);
	}

	const lines = readFileSync(resolve(process.cwd(), input), "utf-8")
		.split("\n")
		.map((l) => l.trim())
		.filter((l) => l.length > 0);

	const entries = lines.map((line) => {
		const colonIdx = line.indexOf(":");
		if (colonIdx === -1) {
			return { word: line, example: "" };
		}
		return { word: line.slice(0, colonIdx).trim(), example: line.slice(colonIdx + 1).trim() };
	});

	const words = entries.map((e) => e.word);
	const exampleMap = new Map(entries.map((e) => [e.word, e.example]));

	console.log(`\nTool B: Filling ${type} metadata for ${words.length} words (${level})`);
	console.log(`Output: ${output}\n`);

	const promptBuilder = PROMPT_MAP[type];
	const keyField = KEY_FIELD_MAP[type];

	const rawResults = await processBatches(words, (batch) => promptBuilder(batch, level), {
		batchSize,
		dryRun,
	});

	if (dryRun) {
		console.log("\nDry run complete. No files written.");
		return;
	}

	// Inject user-provided example sentences into LLM results before validation
	const injectedResults = rawResults.map((raw) => {
		try {
			const cleaned = raw
				.replace(/^```json?\n?/, "")
				.replace(/\n?```$/, "")
				.trim();
			const parsed = JSON.parse(cleaned) as Record<string, unknown>[];
			const arr = Array.isArray(parsed) ? parsed : [parsed];
			for (const item of arr) {
				const key = (item[keyField] as string) ?? "";
				const example =
					exampleMap.get(key) ??
					exampleMap.get(`der ${key}`) ??
					exampleMap.get(`die ${key}`) ??
					exampleMap.get(`das ${key}`) ??
					"";
				item.example = example;
			}
			return JSON.stringify(arr);
		} catch {
			return raw;
		}
	});

	const schema = SCHEMA_MAP[type];
	const { valid, errors } = validateBatchResults(
		injectedResults,
		schema as z.ZodType<z.infer<typeof schema>>,
	);

	if (errors.length > 0) {
		console.error(`\n${errors.length} validation error(s):`);
		for (const err of errors) {
			console.error(`  [${err.index}]`, JSON.stringify(err.issues, null, 2));
		}
	}

	console.log(`\n${valid.length} valid entries.`);

	let existing: Record<string, unknown>[] = [];
	if (existsSync(output)) {
		existing = JSON.parse(readFileSync(output, "utf-8")) as Record<string, unknown>[];
	}

	const merged = mergeWithExisting(existing, valid as Record<string, unknown>[], keyField);

	writeFileSync(output, `${JSON.stringify(merged, null, 2)}\n`);
	console.log(`Written ${merged.length} entries to ${output}`);
}

async function validate() {
	const { type, output } = parseArgs();
	const schema = SCHEMA_MAP[type];

	if (!existsSync(output)) {
		console.error(`File not found: ${output}`);
		process.exit(1);
	}

	const raw = readFileSync(output, "utf-8");
	const parsed = JSON.parse(raw) as unknown[];

	let valid = 0;
	let invalid = 0;

	for (let i = 0; i < parsed.length; i++) {
		const result = schema.safeParse(parsed[i]);
		if (result.success) {
			valid++;
		} else {
			invalid++;
			console.error(`  [${i}]`, JSON.stringify(result.error.issues, null, 2));
		}
	}

	console.log(`\nValidation: ${valid} valid, ${invalid} invalid out of ${parsed.length} total.`);
	process.exit(invalid > 0 ? 1 : 0);
}

const command = process.argv[2] ?? "fill";
if (command === "validate") {
	validate().catch(console.error);
} else {
	fill().catch(console.error);
}
