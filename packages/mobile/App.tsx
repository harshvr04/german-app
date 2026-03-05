import type { Level } from "@german/core/types";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { CompleteScreen } from "./src/components/CompleteScreen";
import { DictionaryScreen } from "./src/components/DictionaryScreen";
import { FlashcardScreen } from "./src/components/FlashcardScreen";
import { SetupScreen } from "./src/components/SetupScreen";
import { useSession } from "./src/hooks/useSession";

export default function App() {
	const { state, start, answerRight, answerWrong, reset } = useSession();
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
			<>
				<StatusBar style="light" />
				<DictionaryScreen
					level={dictionaryMode === "all" ? null : dictionaryMode}
					onBack={handleDictionaryBack}
				/>
			</>
		);
	}

	if (state.phase === "setup") {
		return (
			<>
				<StatusBar style="light" />
				<SetupScreen
					onComplete={start}
					onDictionary={handleDictionary}
					onGlobalDictionary={handleGlobalDictionary}
				/>
			</>
		);
	}

	if (state.phase === "active") {
		const card = state.cards[state.currentIndex]!;
		return (
			<>
				<StatusBar style="light" />
				<FlashcardScreen
					card={card}
					index={state.currentIndex}
					total={state.cards.length}
					onRight={answerRight}
					onWrong={answerWrong}
					onBack={reset}
				/>
			</>
		);
	}

	if (state.phase === "revision") {
		const card = state.cards[state.currentIndex]!;
		return (
			<>
				<StatusBar style="light" />
				<FlashcardScreen
					card={card}
					index={state.currentIndex}
					total={state.cards.length}
					revisionRound={state.round}
					onRight={answerRight}
					onWrong={answerWrong}
					onBack={reset}
				/>
			</>
		);
	}

	return (
		<>
			<StatusBar style="light" />
			<CompleteScreen stats={state.stats} onNewSession={reset} />
		</>
	);
}
