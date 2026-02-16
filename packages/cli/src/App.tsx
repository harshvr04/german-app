import type { Category, Level, VocabDirection } from "@german/core/types";
import { useApp } from "ink";
import { Complete } from "./components/Complete.js";
import { Flashcard } from "./components/Flashcard.js";
import { Setup } from "./components/Setup.js";
import { useSession } from "./hooks/useSession.js";

export function App() {
	const { state, start, answerRight, answerWrong } = useSession();
	const { exit } = useApp();

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
