import type { SessionHistoryStorage } from "@german/core/session";
import type { Level } from "@german/core/types";
import { LEVELS } from "@german/core/types";
import { useCallback, useEffect, useState } from "react";
import { getTotalWordCount, hasDataForLevel } from "../data/loader";

interface WordCount {
	count: number;
	total: number;
}

export function useWordCounter(storage: SessionHistoryStorage) {
	const [counts, setCounts] = useState<Record<Level, WordCount>>(() => {
		const initial = {} as Record<Level, WordCount>;
		for (const level of LEVELS) {
			initial[level] = { count: 0, total: getTotalWordCount(level) };
		}
		return initial;
	});

	const loadCounts = useCallback(
		async (signal?: { cancelled: boolean }) => {
			const updated = {} as Record<Level, WordCount>;
			for (const level of LEVELS) {
				if (!hasDataForLevel(level)) {
					updated[level] = { count: 0, total: 0 };
					continue;
				}
				const words = await storage.getEncounteredWords(level);
				if (signal?.cancelled) return;
				updated[level] = { count: words.length, total: getTotalWordCount(level) };
			}
			if (signal?.cancelled) return;
			setCounts(updated);
		},
		[storage],
	);

	useEffect(() => {
		const signal = { cancelled: false };
		loadCounts(signal);
		return () => {
			signal.cancelled = true;
		};
	}, [loadCounts]);

	const reset = useCallback(
		async (level: Level) => {
			await storage.resetEncounteredWords(level);
			setCounts((prev) => ({
				...prev,
				[level]: { count: 0, total: prev[level].total },
			}));
		},
		[storage],
	);

	return { counts, refresh: loadCounts, reset };
}
