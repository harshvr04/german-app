import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getTotalWordCount } from "@german/core/data";
import type { SessionHistoryStorage } from "@german/core/session";
import type { Level } from "@german/core/types";
import { LEVELS } from "@german/core/types";
import { useCallback, useEffect, useState } from "react";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = resolve(__dirname, "../../../assets/data");

interface WordCount {
	count: number;
	total: number;
}

export function useWordCounter(storage: SessionHistoryStorage) {
	const [counts, setCounts] = useState<Record<Level, WordCount>>(() => {
		const initial = {} as Record<Level, WordCount>;
		for (const level of LEVELS) {
			initial[level] = { count: 0, total: getTotalWordCount(DATA_DIR, level) };
		}
		return initial;
	});

	const loadCounts = useCallback(async () => {
		const updated = {} as Record<Level, WordCount>;
		for (const level of LEVELS) {
			const total = getTotalWordCount(DATA_DIR, level);
			if (total === 0) {
				updated[level] = { count: 0, total: 0 };
				continue;
			}
			const words = await storage.getEncounteredWords(level);
			updated[level] = { count: words.length, total };
		}
		setCounts(updated);
	}, [storage]);

	useEffect(() => {
		loadCounts();
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
