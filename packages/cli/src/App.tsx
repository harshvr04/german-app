import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAdjectives, loadNouns, loadOthers, loadVerbs } from "@german/core/data";
import { generateStarredVocabCards } from "@german/core/generators";
import type { LevelWordData } from "@german/core/generators";
import { extractBaseWord } from "@german/core/session";
import type { Category, Level, VocabDirection } from "@german/core/types";
import { LEVELS } from "@german/core/types";
import { useApp } from "ink";
import { useCallback, useMemo, useState } from "react";
import { Complete } from "./components/Complete.js";
import { Dictionary } from "./components/Dictionary.js";
import { Flashcard } from "./components/Flashcard.js";
import { Setup } from "./components/Setup.js";
import { useSession } from "./hooks/useSession.js";
import { useStarredWords } from "./hooks/useStarredWords.js";
import { useWordCounter } from "./hooks/useWordCounter.js";
import { cliHistoryStorage } from "./storage/session-history.js";
import { cliStarredStorage } from "./storage/starred.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = resolve(__dirname, "../../../assets/data");

export function App() {
	const { state, start, startWithCards, answerRight, answerWrong } = useSession(cliHistoryStorage);
	const { counts: wordCounts, reset: resetCounter } = useWordCounter(cliHistoryStorage);
	const starred = useStarredWords(cliStarredStorage);
	const { exit } = useApp();
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

	const loadLevelData = useCallback(
		(level: Level): LevelWordData => ({
			nouns: loadNouns(DATA_DIR, level),
			verbs: loadVerbs(DATA_DIR, level),
			adjectives: loadAdjectives(DATA_DIR, level),
			others: loadOthers(DATA_DIR, level),
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
		const card = state.cards[state.currentIndex]!;
		const isVocabSession = state.config.category === "vocab" || state.config.category === "starred";
		const baseWord = extractBaseWord(card.id);
		const cardLevel = (card.level ?? state.config.level) as Level;

		return (
			<Flashcard
				card={card}
				index={state.currentIndex}
				total={state.cards.length}
				revisionRound={state.phase === "revision" ? state.round : undefined}
				onRight={answerRight}
				onWrong={answerWrong}
				isStarred={isVocabSession ? starred.isStarred(baseWord, cardLevel) : undefined}
				onToggleStar={isVocabSession ? () => starred.toggleStar(baseWord, cardLevel) : undefined}
			/>
		);
	}

	return <Complete stats={state.stats} onExit={exit} />;
}
