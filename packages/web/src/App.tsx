import { generateStarredVocabCards } from "@german/core/generators";
import type { LevelWordData } from "@german/core/generators";
import { extractBaseWord } from "@german/core/session";
import type { Level } from "@german/core/types";
import { LEVELS } from "@german/core/types";
import { useCallback, useMemo, useState } from "react";
import "./App.css";
import { CompleteScreen } from "./components/CompleteScreen";
import { DictionaryScreen } from "./components/DictionaryScreen";
import { FlashcardScreen } from "./components/FlashcardScreen";
import { SetupScreen } from "./components/SetupScreen";
import { VerbDictionaryScreen } from "./components/VerbDictionaryScreen";
import { loadAdjectives, loadNouns, loadOthers, loadVerbs } from "./data/loader";
import { useSession } from "./hooks/useSession";
import { useStarredWords } from "./hooks/useStarredWords";
import { useWordCounter } from "./hooks/useWordCounter";
import { webHistoryStorage } from "./storage/session-history";
import { webStarredStorage } from "./storage/starred";

export default function App() {
	const { state, start, startWithCards, answerRight, answerWrong, reset } =
		useSession(webHistoryStorage);
	const {
		counts: wordCounts,
		refresh: refreshCounts,
		reset: resetCounter,
	} = useWordCounter(webHistoryStorage);
	const starred = useStarredWords(webStarredStorage);
	const [dictionaryMode, setDictionaryMode] = useState<Level | "all" | null>(null);
	const [verbDictMode, setVerbDictMode] = useState<Level | "all" | null>(null);

	const starredCountByLevel = useMemo(() => {
		const counts = {} as Record<Level, number>;
		for (const l of LEVELS) {
			counts[l] = starred.starredForLevel(l).length;
		}
		return counts;
	}, [starred]);

	const handleReset = useCallback(() => {
		reset();
		refreshCounts();
		starred.refresh();
	}, [reset, refreshCounts, starred]);

	const loadLevelData = useCallback(
		(level: Level): LevelWordData => ({
			nouns: loadNouns(level),
			verbs: loadVerbs(level),
			adjectives: loadAdjectives(level),
			others: loadOthers(level),
		}),
		[],
	);

	const handleStarredReview = useCallback(
		(level: Level) => {
			const words = starred.starredForLevel(level);
			if (words.length === 0) return;
			const dataByLevel = new Map<Level, LevelWordData>();
			dataByLevel.set(level, loadLevelData(level));
			const cards = generateStarredVocabCards(words, dataByLevel, "de_to_en");
			if (cards.length === 0) return;
			startWithCards(cards, { level, category: "starred", batchSize: cards.length });
		},
		[starred, loadLevelData, startWithCards],
	);

	const handleGlobalStarredReview = useCallback(() => {
		const words = starred.starredWords;
		if (words.length === 0) return;
		const levels = [...new Set(words.map((w) => w.level))] as Level[];
		const dataByLevel = new Map<Level, LevelWordData>();
		for (const l of levels) {
			dataByLevel.set(l, loadLevelData(l));
		}
		const cards = generateStarredVocabCards(words, dataByLevel, "de_to_en");
		if (cards.length === 0) return;
		const firstLevel = levels[0] ?? ("A1" as Level);
		startWithCards(cards, { level: firstLevel, category: "starred", batchSize: cards.length });
	}, [starred.starredWords, loadLevelData, startWithCards]);

	// Dictionary modes
	if (dictionaryMode) {
		return (
			<DictionaryScreen
				level={dictionaryMode === "all" ? null : dictionaryMode}
				onBack={() => setDictionaryMode(null)}
			/>
		);
	}

	if (verbDictMode) {
		return (
			<VerbDictionaryScreen
				level={verbDictMode === "all" ? null : verbDictMode}
				onBack={() => setVerbDictMode(null)}
			/>
		);
	}

	// Session states
	if (state.phase === "setup") {
		return (
			<SetupScreen
				onComplete={start}
				onDictionary={(l) => setDictionaryMode(l)}
				onGlobalDictionary={() => setDictionaryMode("all")}
				onVerbDictionary={(l) => setVerbDictMode(l)}
				onGlobalVerbDictionary={() => setVerbDictMode("all")}
				onStarredReview={handleStarredReview}
				onGlobalStarredReview={handleGlobalStarredReview}
				starredCount={starred.starredWords.length}
				starredCountByLevel={starredCountByLevel}
				wordCounts={wordCounts}
				onResetCounter={async (l) => {
					await resetCounter(l);
				}}
			/>
		);
	}

	if (state.phase === "active" || state.phase === "revision") {
		const card = state.cards[state.currentIndex] as (typeof state.cards)[number];
		const isVocabSession = state.config.category === "vocab" || state.config.category === "starred";
		const baseWord = extractBaseWord(card.id);
		const cardLevel = (card.level ?? state.config.level) as Level;

		return (
			<FlashcardScreen
				card={card}
				index={state.currentIndex}
				total={state.cards.length}
				revisionRound={state.phase === "revision" ? state.round : undefined}
				onRight={answerRight}
				onWrong={answerWrong}
				onBack={handleReset}
				isStarred={isVocabSession ? starred.isStarred(baseWord, cardLevel) : undefined}
				onToggleStar={isVocabSession ? () => starred.toggleStar(baseWord, cardLevel) : undefined}
				category={state.config.category}
				sessionLevel={state.config.level}
			/>
		);
	}

	return <CompleteScreen stats={state.stats} onNewSession={handleReset} />;
}
