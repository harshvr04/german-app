import type { Level } from "@german/core/types";

export function buildOtherPrompt(words: string[], level: Level): string {
	return `You are a German linguistics expert. For each German word/expression below, provide the metadata as a JSON array.

These are words that are NOT nouns, verbs, or adjectives — they include adverbs, prepositions, conjunctions, particles, pronouns, expressions, etc.

Each object must have exactly these fields:
- "word": string (the word/expression as given)
- "level": "${level}" (use exactly this value)
- "meaning": string (concise English translation)

Example output:
[
  {"word": "aber", "level": "${level}", "meaning": "but / however"},
  {"word": "immer", "level": "${level}", "meaning": "always"},
  {"word": "zwischen", "level": "${level}", "meaning": "between"}
]

Words to process:
${words.join("\n")}

Respond with ONLY the JSON array, no other text.`;
}
