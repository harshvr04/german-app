import type { Level } from "@german/core/types";

export function buildAdjectivePrompt(words: string[], level: Level): string {
	return `You are a German linguistics expert. For each German adjective below, provide the metadata as a JSON array.

Each object must have exactly these fields:
- "word": string (the adjective as given)
- "is_declinable": boolean — false for adjectives that cannot take declension endings (prima, super, lila, rosa, klasse, extra, etc.). true for all standard declinable adjectives.
- "is_comparable": boolean — false for Absolutadjektive (nicht steigerungsfähig) that have no Komparativ/Superlativ forms (arbeitslos, ausländisch, fertig, gültig, ledig, männlich, weiblich, selbstständig, automatisch, etc.). true for gradable adjectives.
- "komparativ": string | null — the irregular comparative form. Examples:
  - gut → "besser"
  - hoch → "höher"
  - groß → "größer" (umlaut)
  - alt → "älter" (umlaut)
  - teuer → "teurer" (drops e)
  - dunkel → "dunkler" (drops e)
  - null if the comparative is regular (word + "er", e.g. schnell → schneller)
- "superlativ": string | null — the irregular superlative stem (without "am"). Examples:
  - gut → "besten"
  - hoch → "höchsten"
  - groß → "größten" (umlaut)
  - alt → "ältesten" (umlaut + buffer e)
  - null if the superlative is regular (word + "sten", e.g. schnell → schnellsten)
  - Note: include the buffer "e" in stems ending in -d, -t, -s, -ß, -z (e.g. alt → "ältesten", not "ältsten")
- "level": "${level}" (use exactly this value)
- "meaning": string (concise English translation)

Example output:
[
  {"word": "gut", "is_declinable": true, "is_comparable": true, "komparativ": "besser", "superlativ": "besten", "level": "${level}", "meaning": "good"},
  {"word": "klein", "is_declinable": true, "is_comparable": true, "komparativ": null, "superlativ": null, "level": "${level}", "meaning": "small / short"},
  {"word": "arbeitslos", "is_declinable": true, "is_comparable": false, "komparativ": null, "superlativ": null, "level": "${level}", "meaning": "unemployed"},
  {"word": "lila", "is_declinable": false, "is_comparable": false, "komparativ": null, "superlativ": null, "level": "${level}", "meaning": "purple"}
]

Words to process:
${words.join("\n")}

Respond with ONLY the JSON array, no other text.`;
}
