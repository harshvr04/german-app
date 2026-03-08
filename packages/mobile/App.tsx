import { generateStarredVocabCards } from "@german/core/generators";
import type { LevelWordData } from "@german/core/generators";
import { extractBaseWord } from "@german/core/session";
import type { Level } from "@german/core/types";
import { LEVELS } from "@german/core/types";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { CompleteScreen } from "./src/components/CompleteScreen";
import { DictionaryScreen } from "./src/components/DictionaryScreen";
import { FlashcardScreen } from "./src/components/FlashcardScreen";
import { SetupScreen } from "./src/components/SetupScreen";
import { loadAdjectives, loadNouns, loadOthers, loadVerbs } from "./src/data/loader";
import { useSession } from "./src/hooks/useSession";
import { useStarredWords } from "./src/hooks/useStarredWords";
import { useWordCounter } from "./src/hooks/useWordCounter";
import { mobileHistoryStorage } from "./src/storage/session-history";
import { mobileStarredStorage } from "./src/storage/starred";

export default function App() {
	const { state, start, startWithCards, answerRight, answerWrong, reset } =
		useSession(mobileHistoryStorage);
	const {
		counts: wordCounts,
		refresh: refreshCounts,
		reset: resetCounter,
	} = useWordCounter(mobileHistoryStorage);
	const starred = useStarredWords(mobileStarredStorage);
	const [dictionaryMode, setDictionaryMode] = useState<Level | "all" | null>(null);

	const starredCountByLevel = useMemo(() => {
		const counts = {} as Record<Level, number>;
		for (const l of LEVELS) {
			counts[l] = starred.starredForLevel(l).length;
		}
		return counts;
	}, [starred]);

	const handleDictionary = useCallback((level: Level) => {
		setDictionaryMode(level);
	}, []);

	const handleGlobalDictionary = useCallback(() => {
		setDictionaryMode("all");
	}, []);

	const handleDictionaryBack = useCallback(() => {
		setDictionaryMode(null);
	}, []);

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
		startWithCards(cards, { level: levels[0]!, category: "starred", batchSize: cards.length });
	}, [starred.starredWords, loadLevelData, startWithCards]);

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
					onStarredReview={handleStarredReview}
					onGlobalStarredReview={handleGlobalStarredReview}
					starredCount={starred.starredWords.length}
					starredCountByLevel={starredCountByLevel}
					wordCounts={wordCounts}
					onResetCounter={async (l) => {
						await resetCounter(l);
					}}
				/>
			</>
		);
	}

	if (state.phase === "active" || state.phase === "revision") {
		const card = state.cards[state.currentIndex]!;
		const isVocabSession = state.config.category === "vocab" || state.config.category === "starred";
		const baseWord = extractBaseWord(card.id);
		const cardLevel = (card.level ?? state.config.level) as Level;

		return (
			<>
				<StatusBar style="light" />
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
			</>
		);
	}

	return (
		<>
			<StatusBar style="light" />
			<CompleteScreen stats={state.stats} onNewSession={handleReset} />
		</>
	);
}
