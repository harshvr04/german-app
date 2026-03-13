import {
	BATCH_SIZES,
	CATEGORIES,
	LEVELS,
	STEP_TITLES,
	VOCAB_DIRECTIONS,
	WORD_COUNTER_INFO,
} from "@german/core/types";
import type { Category, Level, SessionConfig, VocabDirection } from "@german/core/types";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { hasDataForLevel } from "../data/loader";
import { colors, spacing, typography } from "../theme";
import { InfoModal } from "./InfoModal";

type Step = "level" | "category" | "vocabDirection" | "batchSize";

interface WordCount {
	count: number;
	total: number;
}

interface Props {
	onComplete: (config: SessionConfig) => void;
	onDictionary: (level: Level) => void;
	onGlobalDictionary: () => void;
	onStarredReview: (level: Level) => void;
	onGlobalStarredReview: () => void;
	starredCount: number;
	starredCountByLevel: Record<Level, number>;
	wordCounts: Record<Level, WordCount>;
	onResetCounter: (level: Level) => void;
	onExit: () => void;
}

export function SetupScreen({
	onComplete,
	onDictionary,
	onGlobalDictionary,
	onStarredReview,
	onGlobalStarredReview,
	starredCount,
	starredCountByLevel,
	wordCounts,
	onResetCounter,
	onExit,
}: Props) {
	const [step, setStep] = useState<Step>("level");
	const [level, setLevel] = useState<Level | null>(null);
	const [category, setCategory] = useState<Category | null>(null);
	const [vocabDirection, setVocabDirection] = useState<VocabDirection | undefined>(undefined);
	const [infoModalVisible, setInfoModalVisible] = useState(false);

	const totalCount = LEVELS.reduce(
		(acc, l) => {
			const wc = wordCounts[l];
			return { count: acc.count + wc.count, total: acc.total + wc.total };
		},
		{ count: 0, total: 0 },
	);

	const goBack = () => {
		if (step === "category") {
			setLevel(null);
			setStep("level");
		} else if (step === "vocabDirection") {
			setCategory(null);
			setStep("category");
		} else if (step === "batchSize") {
			if (category === "vocab" && vocabDirection) {
				setVocabDirection(undefined);
				setStep("vocabDirection");
			} else {
				setCategory(null);
				setStep("category");
			}
		}
	};

	const title = STEP_TITLES[step];

	const breadcrumbs = [
		level,
		category && CATEGORIES.find((c) => c.value === category)?.label,
		vocabDirection && VOCAB_DIRECTIONS.find((d) => d.value === vocabDirection)?.label,
	].filter(Boolean);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerRow}>
					<Text style={styles.appTitle}>German Practice</Text>
					{step !== "level" && (
						<Pressable style={styles.backButton} onPress={goBack}>
							<Text style={styles.backButtonText}>←</Text>
						</Pressable>
					)}
				</View>
				{breadcrumbs.length > 0 && (
					<View style={styles.breadcrumbRow}>
						<Text style={styles.breadcrumbs}>{breadcrumbs.join(" › ")}</Text>
						{level && step !== "level" && wordCounts[level].total > 0 && (
							<View style={styles.counterRow}>
								<Text style={styles.counterText}>
									{wordCounts[level].count}/{wordCounts[level].total}
								</Text>
								<Pressable onPress={() => setInfoModalVisible(true)} hitSlop={8}>
									<Text style={styles.infoIcon}>(i)</Text>
								</Pressable>
							</View>
						)}
					</View>
				)}
			</View>

			<Text style={styles.title}>{title}</Text>

			<ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
				{step === "level" && (
					<>
						{LEVELS.map((l) => {
							const available = hasDataForLevel(l);
							return (
								<Pressable
									key={l}
									style={[styles.option, !available && styles.optionDisabled]}
									disabled={!available}
									onPress={() => {
										setLevel(l);
										setStep("category");
									}}
								>
									<Text style={[styles.optionText, !available && styles.optionTextDisabled]}>
										{l}
									</Text>
									{!available && <Text style={styles.comingSoon}>Coming soon</Text>}
								</Pressable>
							);
						})}
						{totalCount.total > 0 && (
							<View style={styles.globalCounterRow}>
								<Text style={styles.counterText}>
									{totalCount.count}/{totalCount.total}
								</Text>
								<Pressable onPress={() => setInfoModalVisible(true)} hitSlop={8}>
									<Text style={styles.infoIcon}>(i)</Text>
								</Pressable>
							</View>
						)}
						<View style={styles.globalDictionarySpacer} />
						<Pressable onPress={onGlobalDictionary}>
							<Text style={styles.globalLinkText}>Dictionary</Text>
						</Pressable>
						{starredCount > 0 && (
							<Pressable onPress={onGlobalStarredReview} style={styles.globalStarredRow}>
								<Text style={styles.globalStarredText}>★ Starred ({starredCount})</Text>
							</Pressable>
						)}
						<View style={styles.creditSpacer} />
						<Pressable style={styles.exitButton} onPress={onExit}>
							<Text style={styles.exitText}>Exit</Text>
						</Pressable>
						<View style={styles.creditSpacer} />
						<Pressable
							onPress={() =>
								Alert.alert(
									"Credits",
									"This App was vibe-coded by Harshvardhan Rao.\n\nReachout to me on Linkedin: harshvardhan-rao-03549760",
								)
							}
						>
							<Text style={styles.creditText}>credits</Text>
						</Pressable>
					</>
				)}

				{step === "category" && (
					<>
						{CATEGORIES.map((c) => (
							<Pressable
								key={c.value}
								style={styles.option}
								onPress={() => {
									setCategory(c.value);
									if (c.value === "vocab") {
										setStep("vocabDirection");
									} else {
										setStep("batchSize");
									}
								}}
							>
								<Text style={styles.optionText}>{c.label}</Text>
							</Pressable>
						))}
						{level === "B2" && (
							<Text style={styles.b2Note}>
								B2 adds only distinctly new words. Verbs include all A1–B2 words.
							</Text>
						)}
						<View style={styles.dictionarySpacer} />
						<Pressable
							style={styles.dictionaryOption}
							onPress={() => {
								onDictionary(level!);
							}}
						>
							<Text style={styles.dictionaryText}>Dictionary</Text>
						</Pressable>
						{level && starredCountByLevel[level] > 0 && (
							<Pressable
								style={styles.starredOption}
								onPress={() => {
									onStarredReview(level);
								}}
							>
								<Text style={styles.starredText}>★ Starred ({starredCountByLevel[level]})</Text>
							</Pressable>
						)}
					</>
				)}

				{step === "vocabDirection" &&
					VOCAB_DIRECTIONS.map((d) => (
						<Pressable
							key={d.value}
							style={styles.option}
							onPress={() => {
								setVocabDirection(d.value);
								setStep("batchSize");
							}}
						>
							<Text style={styles.optionText}>{d.label}</Text>
						</Pressable>
					))}

				{step === "batchSize" &&
					BATCH_SIZES.map((size) => (
						<Pressable
							key={size}
							style={styles.option}
							onPress={() => {
								onComplete({
									level: level!,
									category: category!,
									batchSize: size,
									vocabDirection,
								});
							}}
						>
							<Text style={styles.optionText}>{size} cards</Text>
						</Pressable>
					))}
			</ScrollView>
			<InfoModal
				visible={infoModalVisible}
				onClose={() => setInfoModalVisible(false)}
				message={step === "level" ? WORD_COUNTER_INFO.allLevels : WORD_COUNTER_INFO.level}
				onReset={() => {
					if (step === "level") {
						for (const l of LEVELS) {
							onResetCounter(l);
						}
					} else if (level) {
						onResetCounter(level);
					}
					setInfoModalVisible(false);
				}}
			/>
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
		paddingBottom: spacing.md,
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
		fontSize: 22,
		color: colors.textSecondary,
	},
	breadcrumbs: {
		...typography.caption,
		color: colors.textSecondary,
	},
	title: {
		...typography.body,
		color: colors.textSecondary,
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.md,
	},
	list: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: spacing.lg,
	},
	option: {
		backgroundColor: colors.surface,
		borderRadius: 12,
		paddingVertical: spacing.md,
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.sm,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	optionDisabled: {
		opacity: 0.4,
	},
	optionText: {
		...typography.body,
		color: colors.text,
	},
	optionTextDisabled: {
		color: colors.textDisabled,
	},
	globalDictionarySpacer: {
		height: spacing.xl,
	},
	globalLinkText: {
		fontSize: 12,
		color: colors.accent,
		textAlign: "center",
	},
	globalStarredRow: {
		marginTop: spacing.sm,
	},
	globalStarredText: {
		fontSize: 12,
		color: colors.warning,
		textAlign: "center",
	},
	b2Note: {
		...typography.caption,
		color: colors.textSecondary,
		textAlign: "center",
		marginBottom: spacing.sm,
		fontStyle: "italic",
	},
	dictionarySpacer: {
		height: spacing.md,
	},
	dictionaryOption: {
		backgroundColor: colors.surface,
		borderRadius: 12,
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.sm,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderWidth: 1,
		borderColor: colors.primary,
	},
	dictionaryText: {
		...typography.caption,
		color: colors.accent,
	},
	starredOption: {
		backgroundColor: colors.surface,
		borderRadius: 12,
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.sm,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderWidth: 1,
		borderColor: colors.warning,
	},
	starredText: {
		...typography.caption,
		color: colors.warning,
	},
	comingSoon: {
		...typography.caption,
		color: colors.textDisabled,
	},
	breadcrumbRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: spacing.xs,
	},
	globalCounterRow: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: spacing.xs,
		marginTop: spacing.md,
	},
	counterRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
	},
	counterText: {
		...typography.caption,
		color: colors.textSecondary,
	},
	infoIcon: {
		...typography.caption,
		color: colors.textSecondary,
	},
	exitButton: {
		backgroundColor: colors.surface,
		borderRadius: 12,
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.lg,
		alignSelf: "center",
		borderWidth: 1,
		borderColor: colors.border,
	},
	exitText: {
		...typography.caption,
		color: colors.textSecondary,
	},
	creditSpacer: {
		height: spacing.xl,
	},
	creditText: {
		fontSize: 7,
		color: colors.textDisabled,
		textAlign: "center",
	},
});
