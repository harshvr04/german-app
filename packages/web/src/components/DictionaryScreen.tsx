import { buildDictionary, filterDictionary, mergeDictionary } from "@german/core/dictionary";
import { LEVELS } from "@german/core/types";
import type { DictionaryEntry, Level } from "@german/core/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { hasDataForLevel, loadAdjectives, loadNouns, loadOthers, loadVerbs } from "../data/loader";

interface Props {
	level: Level | null;
	onBack: () => void;
}

function loadLevelEntries(level: Level): DictionaryEntry[] {
	return buildDictionary(
		loadNouns(level),
		loadVerbs(level),
		loadAdjectives(level),
		loadOthers(level),
	);
}

// Module-level cache
const dictionaryCache = new Map<string, DictionaryEntry[]>();

export function DictionaryScreen({ level, onBack }: Props) {
	const cacheKey = level ?? "all";
	const cached = dictionaryCache.get(cacheKey);

	const [query, setQuery] = useState("");
	const [allEntries, setAllEntries] = useState<DictionaryEntry[] | null>(cached ?? null);
	const [fullyLoaded, setFullyLoaded] = useState(cached != null);
	const loadingRef = useRef(false);
	const cancelledRef = useRef(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (dictionaryCache.has(cacheKey)) return;

		cancelledRef.current = false;

		if (level) {
			timerRef.current = setTimeout(() => {
				if (cancelledRef.current) return;
				const entries = loadLevelEntries(level);
				dictionaryCache.set(cacheKey, entries);
				setAllEntries(entries);
				setFullyLoaded(true);
			}, 0);
		} else {
			if (loadingRef.current) return;
			loadingRef.current = true;

			const levelsWithData = LEVELS.filter((l) => hasDataForLevel(l));
			const firstLevel = levelsWithData[0];
			if (!firstLevel) {
				dictionaryCache.set(cacheKey, []);
				setAllEntries([]);
				setFullyLoaded(true);
				return;
			}

			timerRef.current = setTimeout(() => {
				if (cancelledRef.current) return;
				setAllEntries(loadLevelEntries(firstLevel));

				let idx = 1;
				const loadNext = () => {
					if (cancelledRef.current) return;
					if (idx >= levelsWithData.length) {
						setFullyLoaded(true);
						setAllEntries((final) => {
							if (final) dictionaryCache.set(cacheKey, final);
							return final;
						});
						return;
					}
					const nextLevel = levelsWithData[idx] as Level;
					idx++;
					timerRef.current = setTimeout(() => {
						if (cancelledRef.current) return;
						const incoming = loadLevelEntries(nextLevel);
						setAllEntries((prev) => mergeDictionary(prev ?? [], incoming));
						loadNext();
					}, 0);
				};
				loadNext();
			}, 0);
		}

		return () => {
			cancelledRef.current = true;
			loadingRef.current = false;
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [level, cacheKey]);

	const filtered = useMemo(
		() => (allEntries ? filterDictionary(allEntries, query) : []),
		[allEntries, query],
	);

	const searchPending = !fullyLoaded && query.length > 0 && filtered.length === 0;
	const title = level ? `Dictionary — ${level}` : "Dictionary — All Levels";

	return (
		<div className="screen">
			<div className="header">
				<div className="header-row">
					<div className="app-title">{title}</div>
					<button className="back-btn" type="button" onClick={onBack}>
						←
					</button>
				</div>
				<div className="count-text">
					{allEntries
						? `${filtered.length} ${filtered.length === 1 ? "word" : "words"}${!fullyLoaded ? " (loading more…)" : ""}`
						: "Loading..."}
				</div>
			</div>

			<div className="search-container">
				<input
					className="search-input"
					placeholder="Search words..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					autoCapitalize="none"
					autoCorrect="off"
					disabled={allEntries === null}
				/>
			</div>

			{allEntries === null ? (
				<div className="loading">
					<div className="spinner" />
				</div>
			) : searchPending ? (
				<div className="loading">
					<div className="spinner" />
					<div className="patience">Bitte haben Sie Geduld!</div>
				</div>
			) : (
				<div className="scroll-list">
					{filtered.map((item, i) => (
						<div key={`${item.word}-${item.level}-${i}`} className="entry">
							<div className="word-row">
								{!level && <span className="level-badge-small">{item.level}</span>}
								<span className="word-text">{item.word}</span>
							</div>
							<div className="meaning-text">{item.meaning}</div>
							{item.example !== "" && <div className="example">{item.example}</div>}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
