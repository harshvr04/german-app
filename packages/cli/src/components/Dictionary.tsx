import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAdjectives, loadNouns, loadOthers, loadVerbs } from "@german/core/data";
import { buildDictionary, filterDictionary, mergeDictionary } from "@german/core/dictionary";
import { LEVELS } from "@german/core/types";
import type { DictionaryEntry, Level } from "@german/core/types";
import { Box, Text, useInput } from "ink";
import { useEffect, useMemo, useRef, useState } from "react";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DATA_DIR = resolve(__dirname, "../../../assets/data");

const PAGE_SIZE = 10;

interface Props {
	level: Level | null;
	onBack: () => void;
}

function loadLevelEntries(level: Level): DictionaryEntry[] {
	return buildDictionary(
		loadNouns(DATA_DIR, level),
		loadVerbs(DATA_DIR, level),
		loadAdjectives(DATA_DIR, level),
		loadOthers(DATA_DIR, level),
	);
}

export function Dictionary({ level, onBack }: Props) {
	const [query, setQuery] = useState("");
	const [scrollOffset, setScrollOffset] = useState(0);
	const [allEntries, setAllEntries] = useState<DictionaryEntry[] | null>(null);
	const [fullyLoaded, setFullyLoaded] = useState(false);
	const loadingRef = useRef(false);
	const cancelledRef = useRef(false);

	useEffect(() => {
		cancelledRef.current = false;

		if (level) {
			// Single level
			setTimeout(() => {
				if (cancelledRef.current) return;
				setAllEntries(loadLevelEntries(level));
				setFullyLoaded(true);
			}, 0);
		} else {
			// Progressive loading
			if (loadingRef.current) return;
			loadingRef.current = true;

			setTimeout(() => {
				if (cancelledRef.current) return;
				setAllEntries(loadLevelEntries("A1"));

				const remaining = LEVELS.filter((l) => l !== "A1");
				let idx = 0;
				const loadNext = () => {
					if (cancelledRef.current) return;
					if (idx >= remaining.length) {
						setFullyLoaded(true);
						return;
					}
					const nextLevel = remaining[idx]!;
					idx++;
					setTimeout(() => {
						if (cancelledRef.current) return;
						const incoming = loadLevelEntries(nextLevel);
						if (incoming.length > 0) {
							setAllEntries((prev) => mergeDictionary(prev ?? [], incoming));
						}
						loadNext();
					}, 0);
				};
				loadNext();
			}, 0);
		}

		return () => {
			cancelledRef.current = true;
			loadingRef.current = false;
		};
	}, [level]);

	const filtered = useMemo(
		() => (allEntries ? filterDictionary(allEntries, query) : []),
		[allEntries, query],
	);

	const visible = filtered.slice(scrollOffset, scrollOffset + PAGE_SIZE);
	const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
	const currentPage = Math.floor(scrollOffset / PAGE_SIZE) + 1;

	const searchPending = !fullyLoaded && query.length > 0 && filtered.length === 0;

	useInput((input, key) => {
		if (key.escape || (key.leftArrow && !query)) {
			onBack();
			return;
		}

		if (allEntries === null) return;

		if (key.downArrow) {
			setScrollOffset((o) => Math.min(o + PAGE_SIZE, Math.max(0, filtered.length - PAGE_SIZE)));
			return;
		}
		if (key.upArrow) {
			setScrollOffset((o) => Math.max(0, o - PAGE_SIZE));
			return;
		}

		if (key.backspace || key.delete) {
			setQuery((q) => {
				const next = q.slice(0, -1);
				setScrollOffset(0);
				return next;
			});
			return;
		}

		if (input && !key.ctrl && !key.meta) {
			setQuery((q) => {
				setScrollOffset(0);
				return q + input;
			});
		}
	});

	const title = level ? `Dictionary — ${level}` : "Dictionary — All Levels";

	if (allEntries === null) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text bold underline>
					{title}
				</Text>
				<Text> </Text>
				<Text dimColor>Loading dictionary…</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" padding={1}>
			<Text bold underline>
				{title}
			</Text>
			<Text> </Text>

			<Text>
				Search: <Text color="cyan">{query || "…"}</Text>
				<Text dimColor>
					{" "}
					({filtered.length} words{!fullyLoaded ? ", loading more…" : ""})
				</Text>
			</Text>
			<Text> </Text>

			{searchPending ? (
				<Text italic dimColor>
					Bitte haben Sie Geduld!
				</Text>
			) : (
				<>
					{visible.map((entry: DictionaryEntry, i: number) => (
						<Box
							key={`${entry.word}-${entry.level}-${scrollOffset + i}`}
							flexDirection="column"
							marginBottom={1}
						>
							<Text>
								{!level && <Text dimColor>{entry.level} </Text>}
								<Text bold color="green">
									{entry.word}
								</Text>
								<Text dimColor> — {entry.meaning}</Text>
							</Text>
							{entry.example !== "" && (
								<Text italic color="yellow">
									{entry.example}
								</Text>
							)}
						</Box>
					))}

					{filtered.length === 0 && <Text dimColor>No matches found.</Text>}
				</>
			)}

			<Text> </Text>
			<Text dimColor>
				Page {currentPage}/{totalPages || 1} · ↑/↓ page · Type to search · Backspace to clear · Esc
				to back
			</Text>
		</Box>
	);
}
