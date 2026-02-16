import type { Level } from "@german/core/types";

export function buildNounPrompt(words: string[], level: Level): string {
	return `You are a German linguistics expert. For each German noun below, provide the metadata as a JSON array.

Each object must have exactly these fields:
- "word": string (the noun as given)
- "gender": "m" | "f" | "n"
- "plural_suffix": string — the suffix to form plural. Use these conventions:
  - "-e" for adding -e (e.g. Tisch → Tische)
  - "-en" for adding -en (e.g. Lampe → Lampen)
  - "-er" for adding -er (e.g. Kind → Kinder)
  - "-n" for adding -n (e.g. Blume → Blumen)
  - "-nen" for feminine -in nouns (e.g. Lehrerin → Lehrerinnen)
  - "-s" for adding -s (e.g. Auto → Autos)
  - "-se" for adding -se (e.g. Ergebnis → Ergebnisse)
  - "∅" for no change (e.g. Lehrer → Lehrer)
  - "¨e" for umlaut + -e (e.g. Stadt → Städte)
  - "¨er" for umlaut + -er (e.g. Buch → Bücher)
  - "¨" for umlaut only (e.g. Mutter → Mütter)
- "is_n_dekl": boolean — true if the noun follows N-Deklination (typically masculine nouns ending in -e referring to people/animals, plus exceptions like Herr, Name, Gedanke, Buchstabe)
- "level": "${level}" (use exactly this value)
- "meaning": string (concise English translation)

Example output:
[
  {"word": "Tisch", "gender": "m", "plural_suffix": "-e", "is_n_dekl": false, "level": "${level}", "meaning": "table"},
  {"word": "Student", "gender": "m", "plural_suffix": "-en", "is_n_dekl": true, "level": "${level}", "meaning": "student (male)"},
  {"word": "Lehrerin", "gender": "f", "plural_suffix": "-nen", "is_n_dekl": false, "level": "${level}", "meaning": "teacher (female)"}
]

Words to process:
${words.join("\n")}

Respond with ONLY the JSON array, no other text.`;
}
