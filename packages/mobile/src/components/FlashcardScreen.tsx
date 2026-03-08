import type { Card } from "@german/core/types";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme";

interface Props {
	card: Card;
	index: number;
	total: number;
	revisionRound?: number | undefined;
	onRight: () => void;
	onWrong: () => void;
	onBack: () => void;
	isStarred?: boolean | undefined;
	onToggleStar?: (() => void) | undefined;
}

export function FlashcardScreen({
	card,
	index,
	total,
	revisionRound,
	onRight,
	onWrong,
	onBack,
	isStarred,
	onToggleStar,
}: Props) {
	const [revealed, setRevealed] = useState(false);
	const [showDetails, setShowDetails] = useState(false);

	// Reset when card changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset state when index prop changes
	useEffect(() => {
		setRevealed(false);
		setShowDetails(false);
	}, [index]);

	const progress = (index + 1) / total;

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				{revisionRound != null && (
					<View style={styles.revisionBanner}>
						<Text style={styles.revisionText}>Revision Round {revisionRound}</Text>
					</View>
				)}
				<View style={styles.headerRow}>
					<View style={styles.headerLeft}>
						<Text style={styles.progress}>
							Card {index + 1} / {total}
						</Text>
						{card.level && <Text style={styles.levelBadge}>{card.level}</Text>}
					</View>
					<View style={styles.headerRight}>
						{isStarred != null && onToggleStar && (
							<Pressable style={styles.starButton} onPress={onToggleStar} hitSlop={8}>
								<Text style={[styles.starText, isStarred && styles.starTextActive]}>
									{isStarred ? "★" : "☆"}
								</Text>
							</Pressable>
						)}
						<Pressable style={styles.backButton} onPress={onBack}>
							<Text style={styles.backButtonText}>✕</Text>
						</Pressable>
					</View>
				</View>
				<View style={styles.progressBarContainer}>
					<View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
				</View>
			</View>

			{/* Card */}
			<ScrollView style={styles.cardScroll} contentContainerStyle={styles.cardScrollContent}>
				<Pressable style={styles.card} onPress={() => !revealed && setRevealed(true)}>
					<Text style={styles.question}>{card.question}</Text>
					{card.hint && <Text style={styles.hint}>{card.hint}</Text>}

					{revealed ? (
						<View style={styles.answerSection}>
							<View style={styles.divider} />
							<Text style={styles.answer}>{card.answer}</Text>
							{card.example && <Text style={styles.example}>e.g. {card.example}</Text>}
						</View>
					) : (
						<Text style={styles.tapPrompt}>Tap to reveal answer</Text>
					)}
				</Pressable>

				{/* Details toggle */}
				{revealed && card.details && (
					<>
						<Pressable style={styles.detailsToggle} onPress={() => setShowDetails((prev) => !prev)}>
							<Text style={styles.detailsToggleText}>
								{showDetails ? "Hide details" : "Show full conjugation"}
							</Text>
						</Pressable>
						{showDetails && (
							<View style={styles.detailsBox}>
								<Text style={styles.detailsText}>{card.details}</Text>
							</View>
						)}
					</>
				)}
			</ScrollView>

			{/* Action buttons */}
			{revealed && (
				<View style={styles.buttons}>
					<Pressable style={[styles.button, styles.wrongButton]} onPress={onWrong}>
						<Text style={styles.buttonText}>✗ Wrong</Text>
					</Pressable>
					<Pressable style={[styles.button, styles.rightButton]} onPress={onRight}>
						<Text style={styles.buttonText}>✓ Got it</Text>
					</Pressable>
				</View>
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
		paddingTop: spacing.lg,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
	},
	backButton: {
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.xs,
	},
	backButtonText: {
		...typography.body,
		color: colors.textSecondary,
	},
	starButton: {
		paddingHorizontal: spacing.xs,
		paddingVertical: spacing.xs,
	},
	starText: {
		fontSize: 22,
		color: colors.textSecondary,
	},
	starTextActive: {
		color: colors.warning,
	},
	levelBadge: {
		...typography.caption,
		color: colors.warning,
		fontWeight: "600",
	},
	revisionBanner: {
		backgroundColor: colors.warning,
		borderRadius: 8,
		paddingVertical: spacing.xs,
		paddingHorizontal: spacing.md,
		alignSelf: "flex-start",
		marginBottom: spacing.sm,
	},
	revisionText: {
		...typography.caption,
		color: colors.background,
		fontWeight: "700",
	},
	progress: {
		...typography.caption,
		color: colors.textSecondary,
	},
	progressBarContainer: {
		height: 4,
		backgroundColor: colors.surface,
		borderRadius: 2,
		marginTop: spacing.sm,
		overflow: "hidden",
	},
	progressBar: {
		height: 4,
		backgroundColor: colors.correct,
		borderRadius: 2,
	},
	cardScroll: {
		flex: 1,
	},
	cardScrollContent: {
		padding: spacing.lg,
	},
	card: {
		backgroundColor: colors.surface,
		borderRadius: 16,
		padding: spacing.lg,
	},
	question: {
		...typography.question,
		color: colors.text,
	},
	hint: {
		...typography.caption,
		color: colors.textSecondary,
		marginTop: spacing.sm,
	},
	tapPrompt: {
		...typography.caption,
		color: colors.textSecondary,
		marginTop: spacing.lg,
		textAlign: "center",
	},
	answerSection: {
		marginTop: spacing.md,
	},
	divider: {
		height: 1,
		backgroundColor: colors.border,
		marginBottom: spacing.md,
	},
	answer: {
		...typography.answer,
		color: colors.correct,
	},
	example: {
		...typography.caption,
		color: colors.textSecondary,
		marginTop: spacing.sm,
		fontStyle: "italic",
	},
	detailsToggle: {
		marginTop: spacing.md,
		alignSelf: "center",
	},
	detailsToggleText: {
		...typography.caption,
		color: colors.accent,
	},
	detailsBox: {
		backgroundColor: colors.surface,
		borderRadius: 12,
		padding: spacing.md,
		marginTop: spacing.sm,
	},
	detailsText: {
		...typography.caption,
		color: colors.textSecondary,
		fontFamily: "monospace",
	},
	buttons: {
		flexDirection: "row",
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.xl,
		gap: spacing.md,
	},
	button: {
		flex: 1,
		borderRadius: 12,
		paddingVertical: spacing.md,
		alignItems: "center",
	},
	wrongButton: {
		backgroundColor: colors.wrong,
	},
	rightButton: {
		backgroundColor: colors.correct,
	},
	buttonText: {
		...typography.body,
		color: colors.text,
		fontWeight: "700",
	},
});
