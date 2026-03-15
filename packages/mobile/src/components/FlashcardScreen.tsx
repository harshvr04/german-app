import type { Card } from "@german/core/types";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { REPORT_WEBHOOK_URL } from "../config";
import { scale, spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import { ReportModal } from "./ReportModal";

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
	category?: string | undefined;
	sessionLevel?: string | undefined;
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
	category,
	sessionLevel,
}: Props) {
	const { colors } = useTheme();
	const [revealed, setRevealed] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [reportModalVisible, setReportModalVisible] = useState(false);

	// Reset when card changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset state when index prop changes
	useEffect(() => {
		setRevealed(false);
		setShowDetails(false);
	}, [index]);

	const themed = useMemo(
		() =>
			StyleSheet.create({
				container: { flex: 1, backgroundColor: colors.background },
				backButtonText: { ...typography.body, color: colors.textSecondary },
				starText: { fontSize: scale(22), color: colors.textSecondary },
				starTextActive: { color: colors.warning },
				levelBadge: { ...typography.caption, color: colors.warning, fontWeight: "600" },
				revisionBanner: {
					backgroundColor: colors.warning,
					borderRadius: scale(8),
					paddingVertical: spacing.xs,
					paddingHorizontal: spacing.md,
					alignSelf: "flex-start",
					marginBottom: spacing.sm,
				},
				revisionText: { ...typography.caption, color: colors.background, fontWeight: "700" },
				progress: { ...typography.caption, color: colors.textSecondary },
				progressBarContainer: {
					height: scale(4),
					backgroundColor: colors.surface,
					borderRadius: scale(2),
					marginTop: spacing.sm,
					overflow: "hidden",
				},
				progressBar: { height: scale(4), backgroundColor: colors.correct, borderRadius: scale(2) },
				card: { backgroundColor: colors.surface, borderRadius: scale(16), padding: spacing.lg },
				question: { ...typography.question, color: colors.text },
				hint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
				tapPrompt: {
					...typography.caption,
					color: colors.textSecondary,
					marginTop: spacing.lg,
					textAlign: "center",
				},
				divider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.md },
				answer: { ...typography.answer, color: colors.answerText },
				example: {
					...typography.caption,
					color: colors.textSecondary,
					marginTop: spacing.sm,
					fontStyle: "italic",
				},
				detailsToggleText: { ...typography.caption, color: colors.accent },
				detailsBox: {
					backgroundColor: colors.surface,
					borderRadius: scale(12),
					padding: spacing.md,
					marginTop: spacing.sm,
				},
				detailsText: {
					...typography.caption,
					color: colors.textSecondary,
					fontFamily: "monospace",
				},
				wrongButton: { backgroundColor: colors.wrong },
				rightButton: { backgroundColor: colors.correct },
				reportText: { ...typography.caption, color: colors.textDisabled },
			}),
		[colors],
	);

	const progress = (index + 1) / total;

	return (
		<SafeAreaView style={themed.container}>
			{/* Header */}
			<View style={styles.header}>
				{revisionRound != null && (
					<View style={themed.revisionBanner}>
						<Text style={themed.revisionText}>Revision Round {revisionRound}</Text>
					</View>
				)}
				<View style={styles.headerRow}>
					<View style={styles.headerLeft}>
						<Text style={themed.progress}>
							Card {index + 1} / {total}
						</Text>
						{card.level && <Text style={themed.levelBadge}>{card.level}</Text>}
					</View>
					<View style={styles.headerRight}>
						{isStarred != null && onToggleStar && (
							<Pressable style={styles.starButton} onPress={onToggleStar} hitSlop={8}>
								<Text style={[themed.starText, isStarred && themed.starTextActive]}>
									{isStarred ? "★" : "☆"}
								</Text>
							</Pressable>
						)}
						<Pressable style={styles.backButton} onPress={onBack}>
							<Text style={themed.backButtonText}>✕</Text>
						</Pressable>
					</View>
				</View>
				<View style={themed.progressBarContainer}>
					<View style={[themed.progressBar, { width: `${progress * 100}%` }]} />
				</View>
			</View>

			{/* Card */}
			<ScrollView style={styles.cardScroll} contentContainerStyle={styles.cardScrollContent}>
				<Pressable style={themed.card} onPress={() => !revealed && setRevealed(true)}>
					<Text style={themed.question}>{card.question}</Text>
					{card.hint && <Text style={themed.hint}>{card.hint}</Text>}

					{revealed ? (
						<View style={styles.answerSection}>
							<View style={themed.divider} />
							<Text style={themed.answer}>{card.answer}</Text>
							{card.example && <Text style={themed.example}>e.g. {card.example}</Text>}
						</View>
					) : (
						<Text style={themed.tapPrompt}>Tap to reveal answer</Text>
					)}
				</Pressable>

				{/* Details toggle */}
				{revealed && card.details && (
					<>
						<Pressable style={styles.detailsToggle} onPress={() => setShowDetails((prev) => !prev)}>
							<Text style={themed.detailsToggleText}>
								{showDetails ? "Hide details" : "Additional details"}
							</Text>
						</Pressable>
						{showDetails && (
							<View style={themed.detailsBox}>
								<Text style={themed.detailsText}>{card.details}</Text>
							</View>
						)}
					</>
				)}

				{/* Report issue */}
				{REPORT_WEBHOOK_URL.length > 0 && (
					<Pressable style={styles.reportButton} onPress={() => setReportModalVisible(true)}>
						<Text style={themed.reportText}>Report issue</Text>
					</Pressable>
				)}
			</ScrollView>

			<ReportModal
				visible={reportModalVisible}
				onClose={() => setReportModalVisible(false)}
				word={card.question}
				level={card.level ?? sessionLevel ?? ""}
				category={category ?? ""}
			/>

			{/* Action buttons */}
			{revealed && (
				<View style={styles.buttons}>
					<Pressable style={[styles.button, themed.wrongButton]} onPress={onWrong}>
						<Text style={styles.buttonText}>✗ Wrong</Text>
					</Pressable>
					<Pressable style={[styles.button, themed.rightButton]} onPress={onRight}>
						<Text style={styles.buttonText}>✓ Got it</Text>
					</Pressable>
				</View>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
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
	starButton: {
		paddingHorizontal: spacing.xs,
		paddingVertical: spacing.xs,
	},
	cardScroll: {
		flex: 1,
	},
	cardScrollContent: {
		padding: spacing.lg,
	},
	answerSection: {
		marginTop: spacing.md,
	},
	detailsToggle: {
		marginTop: spacing.md,
		alignSelf: "center",
	},
	buttons: {
		flexDirection: "row",
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.xl,
		gap: spacing.md,
	},
	button: {
		flex: 1,
		borderRadius: scale(12),
		paddingVertical: spacing.md,
		alignItems: "center",
	},
	buttonText: {
		...typography.body,
		color: "#FFFFFF",
		fontWeight: "700",
	},
	reportButton: {
		marginTop: spacing.md,
		alignSelf: "center",
	},
});
