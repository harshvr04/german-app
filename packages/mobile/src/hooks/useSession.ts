import { generateAdjectiveCards } from "@german/core/generators";
import { generateNounCards } from "@german/core/generators";
import { generateVerbCards } from "@german/core/generators";
import { generateVocabCards } from "@german/core/generators";
import { createInitialState, sessionReducer } from "@german/core/session";
import type { Card, SessionConfig } from "@german/core/types";
import { useCallback, useReducer } from "react";
import { loadAdjectives, loadNouns, loadOthers, loadVerbs } from "../data/loader";

function resolveCards(config: SessionConfig): Card[] {
	const nouns = loadNouns(config.level);
	const verbs = loadVerbs(config.level);
	const adjectives = loadAdjectives(config.level);
	const others = loadOthers(config.level);

	switch (config.category) {
		case "vocab":
			return generateVocabCards(
				nouns,
				verbs,
				adjectives,
				config.batchSize,
				config.vocabDirection ?? "de_to_en",
				others,
			);
		case "nouns":
			return generateNounCards(nouns, config.batchSize);
		case "verbs":
			return generateVerbCards(verbs, config.batchSize);
		case "adjectives":
			return generateAdjectiveCards(adjectives, config.batchSize);
		case "dictionary":
			return [];
	}
}

export function useSession() {
	const [state, dispatch] = useReducer(sessionReducer, undefined, createInitialState);

	const start = useCallback((config: SessionConfig) => {
		const cards = resolveCards(config);
		dispatch({ type: "START", cards, config });
	}, []);

	const answerRight = useCallback(() => {
		dispatch({ type: "ANSWER_RIGHT" });
	}, []);

	const answerWrong = useCallback(() => {
		dispatch({ type: "ANSWER_WRONG" });
	}, []);

	const reset = useCallback(() => {
		dispatch({ type: "RESET" });
	}, []);

	return { state, start, answerRight, answerWrong, reset };
}
