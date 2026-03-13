import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	loadAdjectives,
	loadNouns,
	loadOthers,
	loadVerbs,
	loadVerbsForExercise,
} from "@german/core/data";
import { generateAdjectiveCards } from "@german/core/generators";
import { generateNounCards } from "@german/core/generators";
import { generateVerbCards } from "@german/core/generators";
import { generateVocabCards } from "@german/core/generators";
import {
	createInitialState,
	extractBaseWords,
	sessionHistoryKey,
	sessionReducer,
} from "@german/core/session";
import type { SessionHistoryStorage } from "@german/core/session";
import type { Card, SessionConfig } from "@german/core/types";
import { useCallback, useEffect, useReducer, useRef } from "react";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = resolve(__dirname, "../../../assets/data");

function resolveCards(
	config: SessionConfig,
	excludeWords: string[] = [],
	encounteredWords: string[] = [],
): Card[] {
	const nouns = loadNouns(DATA_DIR, config.level);
	const adjectives = loadAdjectives(DATA_DIR, config.level);
	const others = loadOthers(DATA_DIR, config.level);

	switch (config.category) {
		case "vocab":
			return generateVocabCards(
				nouns,
				loadVerbs(DATA_DIR, config.level),
				adjectives,
				config.batchSize,
				config.vocabDirection ?? "de_to_en",
				others,
				excludeWords,
				encounteredWords,
			);
		case "nouns":
			return generateNounCards(nouns, config.batchSize, excludeWords);
		case "verbs":
			return generateVerbCards(
				loadVerbsForExercise(DATA_DIR, config.level),
				config.batchSize,
				excludeWords,
				config.level,
			);
		case "adjectives":
			return generateAdjectiveCards(adjectives, config.batchSize, excludeWords);
		case "dictionary":
		case "starred":
			return [];
	}
}

export function useSession(storage: SessionHistoryStorage) {
	const [state, dispatch] = useReducer(sessionReducer, undefined, createInitialState);
	const sessionInfoRef = useRef<{
		key: string;
		level: string;
		category: string;
		words: string[];
	} | null>(null);

	const start = useCallback(
		async (config: SessionConfig) => {
			const key = sessionHistoryKey(config);
			const excludeWords = key ? await storage.getExcludedWords(key) : [];
			const encounteredWords =
				config.category === "vocab" ? await storage.getEncounteredWords(config.level) : [];
			let cards = resolveCards(config, excludeWords, encounteredWords);

			// Fallback: if all words were excluded, ignore exclusion
			if (cards.length === 0 && excludeWords.length > 0) {
				cards = resolveCards(config, [], encounteredWords);
			}

			if (key) {
				sessionInfoRef.current = {
					key,
					level: config.level,
					category: config.category,
					words: extractBaseWords(cards),
				};
			}
			dispatch({ type: "START", cards, config });
		},
		[storage],
	);

	// Save session words and update encountered words on completion
	useEffect(() => {
		if (state.phase === "complete" && sessionInfoRef.current) {
			const { key, level, category, words } = sessionInfoRef.current;
			sessionInfoRef.current = null;
			storage.saveSessionWords(key, words);
			if (category === "vocab") {
				storage.getEncounteredWords(level).then((existing) => {
					const merged = [...new Set([...existing, ...words])];
					storage.saveEncounteredWords(level, merged);
				});
			}
		}
	}, [state.phase, storage]);

	const startWithCards = useCallback((cards: Card[], config: SessionConfig) => {
		dispatch({ type: "START", cards, config });
	}, []);

	const answerRight = useCallback(() => {
		dispatch({ type: "ANSWER_RIGHT" });
	}, []);

	const answerWrong = useCallback(() => {
		dispatch({ type: "ANSWER_WRONG" });
	}, []);

	return { state, start, startWithCards, answerRight, answerWrong };
}
