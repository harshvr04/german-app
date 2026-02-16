import type { Level } from "@german/core/types";

export function buildVerbPrompt(words: string[], level: Level): string {
	return `You are a German linguistics expert. For each German verb below, provide the metadata as a JSON array.

Each object must have exactly these fields:
- "infinitiv": string (the verb as given)
- "type": "regular" | "irregular" | "mixed"
  - "regular": verbs with predictable conjugation (machen → machte → gemacht)
  - "irregular": verbs with vowel changes and irregular endings (gehen → ging → gegangen)
  - "mixed": verbs with vowel change but regular -te endings (bringen → brachte → gebracht, denken → dachte → gedacht)
- "auxiliary": "haben" | "sein" — which auxiliary is used in Perfekt
  - "sein" for verbs of movement/change of state (gehen, fahren, werden, sterben, einschlafen, etc.)
  - "haben" for everything else
- "stem_change_pres": string | null — vowel change in present tense du/er forms
  - Arrow notation: "e→i" (geben→gibst), "e→ie" (sehen→siehst), "a→ä" (fahren→fährst), "au→äu" (laufen→läufst)
  - null if no stem change in present
- "present_forms": object | null — ONLY for verbs with unpredictable present tense:
  - sein, haben, werden, wissen, and modal verbs (können, müssen, dürfen, sollen, wollen, mögen)
  - Format: {"ich": "...", "du": "...", "er/sie/es": "...", "wir": "...", "ihr": "...", "sie/Sie": "..."}
  - null for all other verbs
- "praeteritum_root": string — the stem for Präteritum conjugation
  - Regular verbs: verb stem, engine adds -te/-test/-te/-ten/-tet/-ten (machen → "mach")
  - Regular verbs with stem ending in -t/-d: include buffer -e (arbeiten → "arbeite")
  - Irregular verbs: the changed stem, engine adds ∅/-st/∅/-en/-t/-en (gehen → "ging")
  - Mixed verbs: the changed stem, engine adds -te/-test/-te/-ten/-tet/-ten (bringen → "brach")
- "partizip_ii": string — full Partizip II form (e.g. "gemacht", "gegangen", "gebracht")
- "konjunktiv_ii_root": string | null — STEM ONLY, no endings
  - Irregular verbs: the Konjunktiv II stem (gehen → "ging", geben → "gäb", fahren → "führ")
  - Mixed verbs: the modified stem (bringen → "bräch", denken → "däch")
  - Engine appends: irregular → -e/-est/-e/-en/-et/-en, mixed → -te/-test/-te/-ten/-tet/-ten
  - null for regular verbs (engine uses würde + infinitiv)
  - null if identical to praeteritum_root
- "prepositions": array — verb-preposition pairs with governed case
  - Each entry: {"preposition": "auf", "case": "acc" | "dat", "meaning": "to wait for"}
  - Empty array if the verb has no fixed preposition pairs
  - Include ALL common pairs (some verbs have multiple: sich freuen auf + Akk, sich freuen über + Akk)
- "connections": string[] — related prefixed verbs (e.g. for gehen: ["ausgehen", "eingehen"])
- "level": "${level}" (use exactly this value)
- "meaning": string (concise English translation)

Example output:
[
  {"infinitiv": "machen", "type": "regular", "auxiliary": "haben", "stem_change_pres": null, "present_forms": null, "praeteritum_root": "mach", "partizip_ii": "gemacht", "konjunktiv_ii_root": null, "prepositions": [], "connections": [], "level": "${level}", "meaning": "to make / to do"},
  {"infinitiv": "warten", "type": "regular", "auxiliary": "haben", "stem_change_pres": null, "present_forms": null, "praeteritum_root": "warte", "partizip_ii": "gewartet", "konjunktiv_ii_root": null, "prepositions": [{"preposition": "auf", "case": "acc", "meaning": "to wait for"}], "connections": ["abwarten", "erwarten"], "level": "${level}", "meaning": "to wait"},
  {"infinitiv": "gehen", "type": "irregular", "auxiliary": "sein", "stem_change_pres": null, "present_forms": null, "praeteritum_root": "ging", "partizip_ii": "gegangen", "konjunktiv_ii_root": "ging", "prepositions": [], "connections": ["ausgehen", "eingehen"], "level": "${level}", "meaning": "to go"}
]

Words to process:
${words.join("\n")}

Respond with ONLY the JSON array, no other text.`;
}
