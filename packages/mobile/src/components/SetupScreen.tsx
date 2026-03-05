import { LEVELS } from "@german/core/types";
import type { Category, Level, SessionConfig, VocabDirection } from "@german/core/types";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { hasDataForLevel } from "../data/loader";
import { colors, spacing, typography } from "../theme";

type Step = "level" | "category" | "vocabDirection" | "batchSize";

const CATEGORIES: { value: Category; label: string }[] = [
	{ value: "vocab", label: "Vocabulary" },
	{ value: "verbs", label: "Verbs" },
	{ value: "nouns", label: "Nouns" },
	{ value: "adjectives", label: "Adjectives" },
];

const VOCAB_DIRECTIONS: { value: VocabDirection; label: string }[] = [
	{ value: "de_to_en", label: "German → English" },
	{ value: "en_to_de", label: "English → German" },
];

const BATCH_SIZES = [10, 20, 50, 100];

interface Props {
	onComplete: (config: SessionConfig) => void;
	onDictionary: (level: Level) => void;
	onGlobalDictionary: () => void;
}

export function SetupScreen({ onComplete, onDictionary, onGlobalDictionary }: Props) {
	const [step, setStep] = useState<Step>("level");
	const [level, setLevel] = useState<Level | null>(null);
	const [category, setCategory] = useState<Category | null>(null);
	const [vocabDirection, setVocabDirection] = useState<VocabDirection | undefined>(undefined);

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

	const title =
		step === "level"
			? "Select Level"
			: step === "category"
				? "Select Category"
				: step === "vocabDirection"
					? "Select Direction"
					: "Select Batch Size";

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
					<Text style={styles.breadcrumbs}>{breadcrumbs.join(" › ")}</Text>
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
						<View style={styles.globalDictionarySpacer} />
						<Pressable onPress={onGlobalDictionary}>
							<Text style={styles.globalDictionaryText}>Dictionary</Text>
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
						<View style={styles.dictionarySpacer} />
						<Pressable
							style={styles.dictionaryOption}
							onPress={() => {
								onDictionary(level!);
							}}
						>
							<Text style={styles.dictionaryText}>Dictionary</Text>
						</Pressable>
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
		marginTop: spacing.xs,
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
	globalDictionaryText: {
		fontSize: 12,
		color: colors.accent,
		textAlign: "center",
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
	comingSoon: {
		...typography.caption,
		color: colors.textDisabled,
	},
});
