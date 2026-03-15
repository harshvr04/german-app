import {
	BATCH_SIZES,
	CATEGORIES,
	LEVELS,
	STEP_TITLES,
	VOCAB_DIRECTIONS,
	WORD_COUNTER_INFO,
} from "@german/core/types";
import type { Category, Level, SessionConfig, VocabDirection } from "@german/core/types";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { hasDataForLevel } from "../data/loader";
import { scale, spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";
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
	onVerbDictionary: (level: Level) => void;
	onGlobalVerbDictionary: () => void;
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
	onVerbDictionary,
	onGlobalVerbDictionary,
	onStarredReview,
	onGlobalStarredReview,
	starredCount,
	starredCountByLevel,
	wordCounts,
	onResetCounter,
	onExit,
}: Props) {
	const { theme, setTheme, colors } = useTheme();
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

	const themed = useMemo(
		() =>
			StyleSheet.create({
				container: { flex: 1, backgroundColor: colors.background },
				appTitle: { ...typography.title, color: colors.text },
				backButtonText: { fontSize: scale(22), color: colors.textSecondary, fontFamily: "Georgia" },
				breadcrumbs: { ...typography.caption, color: colors.textSecondary },
				sectionTitle: {
					...typography.body,
					color: colors.textSecondary,
				},
				option: {
					backgroundColor: colors.surface,
					borderRadius: scale(12),
					paddingVertical: spacing.md,
					paddingHorizontal: spacing.lg,
					marginBottom: spacing.sm,
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
				},
				optionText: { ...typography.body, color: colors.text },
				optionTextDisabled: { color: colors.textDisabled },
				counterText: { ...typography.caption, color: colors.textSecondary },
				infoIcon: { ...typography.caption, color: colors.textSecondary },
				globalLinkText: {
					fontSize: scale(12),
					color: colors.accent,
					textAlign: "center",
					fontFamily: "Georgia",
				},
				globalStarredText: {
					fontSize: scale(12),
					color: colors.warning,
					textAlign: "center",
					fontFamily: "Georgia",
				},
				b2Note: {
					...typography.caption,
					color: colors.textSecondary,
					textAlign: "center",
					marginBottom: spacing.sm,
					fontStyle: "italic",
				},
				dictionaryOption: {
					backgroundColor: colors.surface,
					borderRadius: scale(12),
					paddingVertical: spacing.sm,
					paddingHorizontal: spacing.lg,
					marginBottom: spacing.sm,
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					borderWidth: 1,
					borderColor: colors.primary,
				},
				dictionaryText: { ...typography.caption, color: colors.accent },
				starredOption: {
					backgroundColor: colors.surface,
					borderRadius: scale(12),
					paddingVertical: spacing.sm,
					paddingHorizontal: spacing.lg,
					marginBottom: spacing.sm,
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					borderWidth: 1,
					borderColor: colors.warning,
				},
				starredText: { ...typography.caption, color: colors.warning },
				comingSoon: { ...typography.caption, color: colors.textDisabled },
				exitButton: {
					backgroundColor: colors.surface,
					borderRadius: scale(12),
					paddingVertical: spacing.sm,
					paddingHorizontal: spacing.lg,
					alignSelf: "center",
					borderWidth: 1,
					borderColor: colors.border,
				},
				exitText: { ...typography.caption, color: colors.textSecondary },
				creditText: {
					fontSize: scale(7),
					color: colors.textDisabled,
					textAlign: "center",
					fontFamily: "Georgia",
				},
				themeCircle: {
					width: scale(26),
					height: scale(26),
					borderRadius: scale(13),
					borderWidth: scale(2),
					borderColor: colors.border,
				},
				themeCircleActive: {
					borderColor: colors.accent,
					borderWidth: scale(3),
				},
			}),
		[colors],
	);

	return (
		<SafeAreaView style={themed.container}>
			<View style={styles.header}>
				<View style={styles.headerRow}>
					<Text style={themed.appTitle}>German Practice</Text>
					{step !== "level" && (
						<Pressable style={styles.backButton} onPress={goBack}>
							<Text style={themed.backButtonText}>←</Text>
						</Pressable>
					)}
				</View>
				{breadcrumbs.length > 0 && (
					<View style={styles.breadcrumbRow}>
						<Text style={themed.breadcrumbs}>{breadcrumbs.join(" › ")}</Text>
						{level && step !== "level" && wordCounts[level].total > 0 && (
							<View style={styles.counterRow}>
								<Text style={themed.counterText}>
									{wordCounts[level].count}/{wordCounts[level].total}
								</Text>
								<Pressable onPress={() => setInfoModalVisible(true)} hitSlop={8}>
									<Text style={themed.infoIcon}>(i)</Text>
								</Pressable>
							</View>
						)}
					</View>
				)}
			</View>

			<View style={styles.sectionTitleRow}>
				<Text style={themed.sectionTitle}>{title}</Text>
				{step === "level" && (
					<View style={styles.themeToggle}>
						<Pressable
							style={[
								themed.themeCircle,
								{ backgroundColor: "#1a1a2e" },
								theme === "dark" && themed.themeCircleActive,
							]}
							onPress={() => setTheme("dark")}
						/>
						<Pressable
							style={[
								themed.themeCircle,
								{ backgroundColor: "#FFFFFF" },
								theme === "light" && themed.themeCircleActive,
							]}
							onPress={() => setTheme("light")}
						/>
					</View>
				)}
			</View>

			<ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
				{step === "level" && (
					<>
						{LEVELS.map((l) => {
							const available = hasDataForLevel(l);
							return (
								<Pressable
									key={l}
									style={[themed.option, !available && styles.optionDisabled]}
									disabled={!available}
									onPress={() => {
										setLevel(l);
										setStep("category");
									}}
								>
									<Text style={[themed.optionText, !available && themed.optionTextDisabled]}>
										{l}
									</Text>
									{!available && <Text style={themed.comingSoon}>Coming soon</Text>}
								</Pressable>
							);
						})}
						{totalCount.total > 0 && (
							<View style={styles.globalCounterRow}>
								<Text style={themed.counterText}>
									{totalCount.count}/{totalCount.total}
								</Text>
								<Pressable onPress={() => setInfoModalVisible(true)} hitSlop={8}>
									<Text style={themed.infoIcon}>(i)</Text>
								</Pressable>
							</View>
						)}
						<View style={styles.globalDictionarySpacer} />
						<Pressable onPress={onGlobalDictionary}>
							<Text style={themed.globalLinkText}>Dictionary</Text>
						</Pressable>
						<Pressable onPress={onGlobalVerbDictionary} style={styles.globalVerbDictRow}>
							<Text style={themed.globalLinkText}>Verb Conjugations</Text>
						</Pressable>
						{starredCount > 0 && (
							<Pressable onPress={onGlobalStarredReview} style={styles.globalStarredRow}>
								<Text style={themed.globalStarredText}>★ Starred ({starredCount})</Text>
							</Pressable>
						)}
						<View style={styles.creditSpacer} />
						<Pressable style={themed.exitButton} onPress={onExit}>
							<Text style={themed.exitText}>Exit</Text>
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
							<Text style={themed.creditText}>credits</Text>
						</Pressable>
					</>
				)}

				{step === "category" && (
					<>
						{CATEGORIES.map((c) => (
							<Pressable
								key={c.value}
								style={themed.option}
								onPress={() => {
									setCategory(c.value);
									if (c.value === "vocab") {
										setStep("vocabDirection");
									} else {
										setStep("batchSize");
									}
								}}
							>
								<Text style={themed.optionText}>{c.label}</Text>
							</Pressable>
						))}
						{level === "B2" && (
							<Text style={themed.b2Note}>
								B2 adds only distinctly new words. Verbs include all A1–B2 words.
							</Text>
						)}
						<View style={styles.dictionarySpacer} />
						<Pressable
							style={themed.dictionaryOption}
							onPress={() => {
								onDictionary(level!);
							}}
						>
							<Text style={themed.dictionaryText}>Dictionary</Text>
						</Pressable>
						<Pressable
							style={themed.dictionaryOption}
							onPress={() => {
								onVerbDictionary(level!);
							}}
						>
							<Text style={themed.dictionaryText}>Verb Conjugations</Text>
						</Pressable>
						{level && starredCountByLevel[level] > 0 && (
							<Pressable
								style={themed.starredOption}
								onPress={() => {
									onStarredReview(level);
								}}
							>
								<Text style={themed.starredText}>★ Starred ({starredCountByLevel[level]})</Text>
							</Pressable>
						)}
					</>
				)}

				{step === "vocabDirection" &&
					VOCAB_DIRECTIONS.map((d) => (
						<Pressable
							key={d.value}
							style={themed.option}
							onPress={() => {
								setVocabDirection(d.value);
								setStep("batchSize");
							}}
						>
							<Text style={themed.optionText}>{d.label}</Text>
						</Pressable>
					))}

				{step === "batchSize" &&
					BATCH_SIZES.map((size) => (
						<Pressable
							key={size}
							style={themed.option}
							onPress={() => {
								onComplete({
									level: level!,
									category: category!,
									batchSize: size,
									vocabDirection,
								});
							}}
						>
							<Text style={themed.optionText}>{size} cards</Text>
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
	backButton: {
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.xs,
	},
	breadcrumbRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: spacing.xs,
	},
	list: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: spacing.lg,
	},
	optionDisabled: {
		opacity: 0.4,
	},
	globalDictionarySpacer: {
		height: spacing.xl,
	},
	globalVerbDictRow: {
		marginTop: spacing.xs,
	},
	globalStarredRow: {
		marginTop: spacing.sm,
	},
	dictionarySpacer: {
		height: spacing.md,
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
	creditSpacer: {
		height: spacing.xl,
	},
	sectionTitleRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.md,
	},
	themeToggle: {
		flexDirection: "row",
		gap: scale(8),
	},
});
