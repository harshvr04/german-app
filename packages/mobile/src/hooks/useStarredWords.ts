import type { StarredWord, StarredWordsStorage } from "@german/core/session";
import type { Level } from "@german/core/types";
import { useCallback, useEffect, useState } from "react";

export function useStarredWords(storage: StarredWordsStorage) {
	const [starredWords, setStarredWords] = useState<StarredWord[]>([]);

	const refresh = useCallback(async () => {
		const words = await storage.getStarredWords();
		setStarredWords(words);
	}, [storage]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const isStarred = useCallback(
		(word: string, level: Level) => starredWords.some((s) => s.word === word && s.level === level),
		[starredWords],
	);

	const toggleStar = useCallback(
		async (word: string, level: Level) => {
			if (starredWords.some((s) => s.word === word && s.level === level)) {
				await storage.removeStarredWord(word, level);
				setStarredWords((prev) => prev.filter((s) => !(s.word === word && s.level === level)));
			} else {
				await storage.addStarredWord(word, level);
				setStarredWords((prev) => [...prev, { word, level }]);
			}
		},
		[storage, starredWords],
	);

	const starredForLevel = useCallback(
		(level: Level) => starredWords.filter((s) => s.level === level),
		[starredWords],
	);

	return { starredWords, isStarred, toggleStar, starredForLevel, refresh };
}
