import { z } from "zod";
import { LEVELS } from "../types/german.js";

const LevelSchema = z.enum(LEVELS);

export const NounSchema = z.object({
	word: z.string(),
	gender: z.enum(["m", "f", "n"]),
	plural_suffix: z.string(),
	is_n_dekl: z.boolean(),
	level: LevelSchema,
	meaning: z.string(),
});

const PersonFormsSchema = z.object({
	ich: z.string(),
	du: z.string(),
	"er/sie/es": z.string(),
	wir: z.string(),
	ihr: z.string(),
	"sie/Sie": z.string(),
});

const VerbPrepositionSchema = z.object({
	preposition: z.string(),
	case: z.enum(["acc", "dat"]),
	meaning: z.string(),
});

export const VerbSchema = z.object({
	infinitiv: z.string(),
	type: z.enum(["regular", "irregular", "mixed"]),
	auxiliary: z.enum(["haben", "sein"]),
	stem_change_pres: z.string().nullable(),
	/** Override for verbs with unpredictable present tense (modals, sein, haben, werden). */
	present_forms: PersonFormsSchema.nullable(),
	praeteritum_root: z.string(),
	partizip_ii: z.string(),
	/** Stem only (no endings). Engine appends endings based on verb type. null for regular verbs (uses würde + infinitiv). */
	konjunktiv_ii_root: z.string().nullable(),
	/** Verb-preposition pairs with governed case (e.g. warten auf + Akk). */
	prepositions: z.array(VerbPrepositionSchema),
	connections: z.array(z.string()),
	level: LevelSchema,
	meaning: z.string(),
});

export const AdjectiveSchema = z.object({
	word: z.string(),
	/** false for prima, super, lila, rosa, etc. — cannot take declension endings. */
	is_declinable: z.boolean(),
	/** Irregular comparative stem. null if regular (word + "er"). e.g. gut → "besser", hoch → "höher". */
	komparativ: z.string().nullable(),
	/** Irregular superlative stem. null if regular (word + "sten"). e.g. gut → "besten", hoch → "höchsten". */
	superlativ: z.string().nullable(),
	level: LevelSchema,
	meaning: z.string(),
});

export type Noun = z.infer<typeof NounSchema>;
export type Verb = z.infer<typeof VerbSchema>;
export type Adjective = z.infer<typeof AdjectiveSchema>;
