import { buildDictionary, filterDictionary, mergeDictionary } from "@german/core/dictionary";
import { LEVELS } from "@german/core/types";
import type { DictionaryEntry, Level } from "@german/core/types";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { hasDataForLevel, loadAdjectives, loadNouns, loadOthers, loadVerbs } from "../data/loader";
import { scale, spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";

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

// Module-level cache: persists across mounts, cleared only on app kill
const dictionaryCache = new Map<string, DictionaryEntry[]>();

export function DictionaryScreen({ level, onBack }: Props) {
	const { colors } = useTheme();
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
			// Single level
			timerRef.current = setTimeout(() => {
				if (cancelledRef.current) return;
				const entries = loadLevelEntries(level);
				dictionaryCache.set(cacheKey, entries);
				setAllEntries(entries);
				setFullyLoaded(true);
			}, 0);
		} else {
			// Progressive loading
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
					const nextLevel = levelsWithData[idx]!;
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

	// Check if search might have results in not-yet-loaded levels
	const searchPending = !fullyLoaded && query.length > 0 && filtered.length === 0;

	const title = level ? `Dictionary — ${level}` : "Dictionary — All Levels";

	const themed = useMemo(
		() =>
			StyleSheet.create({
				container: { flex: 1, backgroundColor: colors.background },
				appTitle: { ...typography.title, color: colors.text },
				backButtonText: { ...typography.body, color: colors.textSecondary },
				count: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
				searchInput: {
					backgroundColor: colors.surface,
					borderRadius: scale(12),
					paddingVertical: spacing.sm,
					paddingHorizontal: spacing.md,
					...typography.body,
					color: colors.text,
					borderWidth: 1,
					borderColor: colors.border,
				},
				patience: {
					...typography.caption,
					color: colors.textSecondary,
					fontStyle: "italic",
					marginTop: spacing.md,
				},
				entry: {
					backgroundColor: colors.surface,
					borderRadius: scale(12),
					padding: spacing.md,
					marginBottom: spacing.sm,
				},
				levelBadge: { fontSize: scale(10), color: colors.accent, fontWeight: "700" },
				word: { ...typography.question, color: colors.text },
				meaning: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
				example: {
					...typography.caption,
					color: colors.textSecondary,
					fontStyle: "italic",
					marginTop: spacing.xs,
				},
			}),
		[colors],
	);

	return (
		<SafeAreaView style={themed.container}>
			<View style={styles.header}>
				<View style={styles.headerRow}>
					<Text style={themed.appTitle}>{title}</Text>
					<Pressable style={styles.backButton} onPress={onBack}>
						<Text style={themed.backButtonText}>←</Text>
					</Pressable>
				</View>
				<Text style={themed.count}>
					{allEntries
						? `${filtered.length} ${filtered.length === 1 ? "word" : "words"}${!fullyLoaded ? " (loading more…)" : ""}`
						: "Loading..."}
				</Text>
			</View>

			<View style={styles.searchContainer}>
				<TextInput
					style={themed.searchInput}
					placeholder="Search words..."
					placeholderTextColor={colors.textDisabled}
					value={query}
					onChangeText={setQuery}
					autoCapitalize="none"
					autoCorrect={false}
					editable={allEntries !== null}
				/>
			</View>

			{allEntries === null ? (
				<View style={styles.loading}>
					<ActivityIndicator size="large" color={colors.accent} />
				</View>
			) : searchPending ? (
				<View style={styles.loading}>
					<ActivityIndicator size="large" color={colors.accent} />
					<Text style={themed.patience}>Bitte haben Sie Geduld!</Text>
				</View>
			) : (
				<FlatList
					data={filtered}
					keyExtractor={(item, index) => `${item.word}-${item.level}-${index}`}
					style={styles.list}
					contentContainerStyle={styles.listContent}
					maxToRenderPerBatch={20}
					windowSize={5}
					removeClippedSubviews
					renderItem={({ item }) => (
						<View style={themed.entry}>
							<View style={styles.wordRow}>
								{!level && <Text style={themed.levelBadge}>{item.level}</Text>}
								<Text style={themed.word}>{item.word}</Text>
							</View>
							<Text style={themed.meaning}>{item.meaning}</Text>
							{item.example !== "" && <Text style={themed.example}>{item.example}</Text>}
						</View>
					)}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	header: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.xl,
		paddingBottom: spacing.sm,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	backButton: {
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.xs,
	},
	searchContainer: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.md,
	},
	loading: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	list: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.xl,
	},
	wordRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
	},
});
