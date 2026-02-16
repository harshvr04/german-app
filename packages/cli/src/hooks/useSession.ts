import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAdjectives, loadNouns, loadVerbs } from "@german/core/data";
import { generateVocabCards } from "@german/core/generators";
import { generateNounCards } from "@german/core/generators";
import { generateVerbCards } from "@german/core/generators";
import { generateAdjectiveCards } from "@german/core/generators";
import { createInitialState, sessionReducer } from "@german/core/session";
import type { Card, SessionConfig } from "@german/core/types";
import { useCallback, useReducer } from "react";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = resolve(__dirname, "../../../assets/data");

function resolveCards(config: SessionConfig): Card[] {
	const nouns = loadNouns(DATA_DIR, config.level);
	const verbs = loadVerbs(DATA_DIR, config.level);
	const adjectives = loadAdjectives(DATA_DIR, config.level);

	switch (config.category) {
		case "vocab":
			return generateVocabCards(nouns, verbs, adjectives, config.batchSize);
		case "nouns":
			return generateNounCards(nouns, config.batchSize);
		case "verbs":
			return generateVerbCards(verbs, config.batchSize);
		case "adjectives":
			return generateAdjectiveCards(adjectives, config.batchSize);
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

	return { state, start, answerRight, answerWrong };
}
