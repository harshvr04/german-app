import type { Category, Level, VocabDirection } from "@german/core/types";
import { useApp } from "ink";
import { useCallback, useState } from "react";
import { Complete } from "./components/Complete.js";
import { Dictionary } from "./components/Dictionary.js";
import { Flashcard } from "./components/Flashcard.js";
import { Setup } from "./components/Setup.js";
import { useSession } from "./hooks/useSession.js";

export function App() {
	const { state, start, answerRight, answerWrong } = useSession();
	const { exit } = useApp();
	const [dictionaryMode, setDictionaryMode] = useState<Level | "all" | null>(null);

	const handleDictionary = useCallback((level: Level) => {
		setDictionaryMode(level);
	}, []);

	const handleGlobalDictionary = useCallback(() => {
		setDictionaryMode("all");
	}, []);

	const handleDictionaryBack = useCallback(() => {
		setDictionaryMode(null);
	}, []);

	if (dictionaryMode) {
		return (
			<Dictionary
				level={dictionaryMode === "all" ? null : dictionaryMode}
				onBack={handleDictionaryBack}
			/>
		);
	}

	if (state.phase === "setup") {
		return (
			<Setup
				onComplete={(
					level: Level,
					category: Category,
					batchSize: number,
					vocabDirection?: VocabDirection,
				) => {
					start({ level, category, batchSize, vocabDirection });
				}}
				onDictionary={handleDictionary}
				onGlobalDictionary={handleGlobalDictionary}
			/>
		);
	}

	if (state.phase === "active") {
		const card = state.cards[state.currentIndex]!;
		return (
			<Flashcard
				card={card}
				index={state.currentIndex}
				total={state.cards.length}
				onRight={answerRight}
				onWrong={answerWrong}
			/>
		);
	}

	if (state.phase === "revision") {
		const card = state.cards[state.currentIndex]!;
		return (
			<Flashcard
				card={card}
				index={state.currentIndex}
				total={state.cards.length}
				revisionRound={state.round}
				onRight={answerRight}
				onWrong={answerWrong}
			/>
		);
	}

	return <Complete stats={state.stats} onExit={exit} />;
}
