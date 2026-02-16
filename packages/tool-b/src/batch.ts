import Anthropic from "@anthropic-ai/sdk";
import pLimit from "p-limit";

const limit = pLimit(3);

interface BatchOptions {
	batchSize: number;
	maxRetries: number;
	dryRun: boolean;
}

const DEFAULTS: BatchOptions = {
	batchSize: 20,
	maxRetries: 3,
	dryRun: false,
};

function chunk<T>(arr: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		chunks.push(arr.slice(i, i + size));
	}
	return chunks;
}

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callClaude(client: Anthropic, prompt: string): Promise<string> {
	const response = await client.messages.create({
		model: "claude-sonnet-4-5-20250929",
		max_tokens: 4096,
		messages: [{ role: "user", content: prompt }],
	});

	const block = response.content[0];
	if (!block || block.type !== "text") {
		throw new Error("Unexpected response format from Claude API");
	}
	return block.text;
}

async function callWithRetry(
	client: Anthropic,
	prompt: string,
	maxRetries: number,
): Promise<string> {
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await callClaude(client, prompt);
		} catch (err) {
			if (attempt === maxRetries) throw err;
			const delay = 2 ** attempt * 1000;
			console.error(`  Retry ${attempt + 1}/${maxRetries} after ${delay}ms...`);
			await sleep(delay);
		}
	}
	throw new Error("Unreachable");
}

export async function processBatches(
	words: string[],
	buildPrompt: (batch: string[]) => string,
	options: Partial<BatchOptions> = {},
): Promise<string[]> {
	const opts = { ...DEFAULTS, ...options };
	const batches = chunk(words, opts.batchSize);
	const client = new Anthropic();

	console.log(`Processing ${words.length} words in ${batches.length} batch(es)...`);

	const results = await Promise.all(
		batches.map((batch, i) =>
			limit(async () => {
				const prompt = buildPrompt(batch);

				if (opts.dryRun) {
					console.log(`\n--- Batch ${i + 1} (dry run) ---`);
					console.log(prompt);
					return "[]";
				}

				console.log(`  Batch ${i + 1}/${batches.length} (${batch.length} words)...`);
				const result = await callWithRetry(client, prompt, opts.maxRetries);
				console.log(`  Batch ${i + 1} complete.`);
				return result;
			}),
		),
	);

	return results;
}
