import type { SessionStats } from "@german/core/types";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale, spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";

interface Props {
	stats: SessionStats;
	onNewSession: () => void;
}

export function CompleteScreen({ stats, onNewSession }: Props) {
	const { colors } = useTheme();
	const elapsed = stats.endTime ? Math.round((stats.endTime - stats.startTime) / 1000) : 0;
	const minutes = Math.floor(elapsed / 60);
	const seconds = elapsed % 60;
	const accuracy =
		stats.totalCards > 0 ? Math.round((stats.correctFirstAttempt / stats.totalCards) * 100) : 0;

	const themed = useMemo(
		() =>
			StyleSheet.create({
				container: { flex: 1, backgroundColor: colors.background },
				title: {
					...typography.title,
					color: colors.text,
					textAlign: "center",
					marginBottom: spacing.xl,
				},
				statsCard: {
					backgroundColor: colors.surface,
					borderRadius: scale(16),
					padding: spacing.lg,
					marginBottom: spacing.xl,
				},
				statLabel: {
					...typography.body,
					color: colors.textSecondary,
				},
				statValue: {
					...typography.body,
					color: colors.text,
					fontWeight: "700",
				},
				button: {
					backgroundColor: colors.accent,
					borderRadius: scale(12),
					paddingVertical: spacing.md,
					alignItems: "center",
				},
				buttonText: {
					...typography.body,
					color: "#FFFFFF",
					fontWeight: "700",
				},
			}),
		[colors],
	);

	return (
		<SafeAreaView style={themed.container}>
			<View style={styles.content}>
				<Text style={themed.title}>Session Complete</Text>

				<View style={themed.statsCard}>
					<View style={styles.statRow}>
						<Text style={themed.statLabel}>Total cards</Text>
						<Text style={themed.statValue}>{String(stats.totalCards)}</Text>
					</View>
					<View style={styles.statRow}>
						<Text style={themed.statLabel}>Correct (first attempt)</Text>
						<Text style={themed.statValue}>
							{stats.correctFirstAttempt}/{stats.totalCards} ({accuracy}%)
						</Text>
					</View>
					<View style={styles.statRow}>
						<Text style={themed.statLabel}>Revision rounds</Text>
						<Text style={themed.statValue}>{String(stats.revisionRounds)}</Text>
					</View>
					<View style={styles.statRow}>
						<Text style={themed.statLabel}>Time</Text>
						<Text style={themed.statValue}>
							{minutes}m {seconds}s
						</Text>
					</View>
				</View>

				<Pressable style={themed.button} onPress={onNewSession}>
					<Text style={themed.buttonText}>New Session</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		justifyContent: "center",
		padding: spacing.lg,
	},
	statRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: spacing.sm,
	},
});
