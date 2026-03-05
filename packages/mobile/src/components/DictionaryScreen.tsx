import { buildDictionary, filterDictionary, mergeDictionary } from "@german/core/dictionary";
import { LEVELS } from "@german/core/types";
import type { DictionaryEntry, Level } from "@german/core/types";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	SafeAreaView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { hasDataForLevel, loadAdjectives, loadNouns, loadOthers, loadVerbs } from "../data/loader";
import { colors, spacing, typography } from "../theme";

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

export function DictionaryScreen({ level, onBack }: Props) {
	const [query, setQuery] = useState("");
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

			const levelsWithData = LEVELS.filter((l) => hasDataForLevel(l));
			const firstLevel = levelsWithData[0];
			if (!firstLevel) {
				setAllEntries([]);
				setFullyLoaded(true);
				return;
			}

			setTimeout(() => {
				if (cancelledRef.current) return;
				setAllEntries(loadLevelEntries(firstLevel));

				let idx = 1;
				const loadNext = () => {
					if (cancelledRef.current) return;
					if (idx >= levelsWithData.length) {
						setFullyLoaded(true);
						return;
					}
					const nextLevel = levelsWithData[idx]!;
					idx++;
					setTimeout(() => {
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
		};
	}, [level]);

	const filtered = useMemo(
		() => (allEntries ? filterDictionary(allEntries, query) : []),
		[allEntries, query],
	);

	// Check if search might have results in not-yet-loaded levels
	const searchPending = !fullyLoaded && query.length > 0 && filtered.length === 0;

	const title = level ? `Dictionary — ${level}` : "Dictionary — All Levels";

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerRow}>
					<Text style={styles.appTitle}>{title}</Text>
					<Pressable style={styles.backButton} onPress={onBack}>
						<Text style={styles.backButtonText}>←</Text>
					</Pressable>
				</View>
				<Text style={styles.count}>
					{allEntries
						? `${filtered.length} ${filtered.length === 1 ? "word" : "words"}${!fullyLoaded ? " (loading more…)" : ""}`
						: "Loading..."}
				</Text>
			</View>

			<View style={styles.searchContainer}>
				<TextInput
					style={styles.searchInput}
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
					<Text style={styles.patience}>Bitte haben Sie Geduld!</Text>
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
						<View style={styles.entry}>
							<View style={styles.wordRow}>
								{!level && <Text style={styles.levelBadge}>{item.level}</Text>}
								<Text style={styles.word}>{item.word}</Text>
							</View>
							<Text style={styles.meaning}>{item.meaning}</Text>
							{item.example !== "" && <Text style={styles.example}>{item.example}</Text>}
						</View>
					)}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
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
	appTitle: {
		...typography.title,
		color: colors.text,
	},
	backButton: {
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.xs,
	},
	backButtonText: {
		...typography.body,
		color: colors.textSecondary,
	},
	count: {
		...typography.caption,
		color: colors.textSecondary,
		marginTop: spacing.xs,
	},
	searchContainer: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.md,
	},
	searchInput: {
		backgroundColor: colors.surface,
		borderRadius: 12,
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.md,
		...typography.body,
		color: colors.text,
		borderWidth: 1,
		borderColor: colors.border,
	},
	loading: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	patience: {
		...typography.caption,
		color: colors.textSecondary,
		fontStyle: "italic",
		marginTop: spacing.md,
	},
	list: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.xl,
	},
	entry: {
		backgroundColor: colors.surface,
		borderRadius: 12,
		padding: spacing.md,
		marginBottom: spacing.sm,
	},
	wordRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
	},
	levelBadge: {
		fontSize: 10,
		color: colors.accent,
		fontWeight: "700",
	},
	word: {
		...typography.question,
		color: colors.text,
	},
	meaning: {
		...typography.body,
		color: colors.textSecondary,
		marginTop: spacing.xs,
	},
	example: {
		...typography.caption,
		color: colors.textSecondary,
		fontStyle: "italic",
		marginTop: spacing.xs,
	},
});
