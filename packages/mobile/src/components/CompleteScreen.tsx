import type { SessionStats } from "@german/core/types";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme";

interface Props {
	stats: SessionStats;
	onNewSession: () => void;
}

export function CompleteScreen({ stats, onNewSession }: Props) {
	const elapsed = stats.endTime ? Math.round((stats.endTime - stats.startTime) / 1000) : 0;
	const minutes = Math.floor(elapsed / 60);
	const seconds = elapsed % 60;
	const accuracy =
		stats.totalCards > 0 ? Math.round((stats.correctFirstAttempt / stats.totalCards) * 100) : 0;

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Session Complete</Text>

				<View style={styles.statsCard}>
					<StatRow label="Total cards" value={String(stats.totalCards)} />
					<StatRow
						label="Correct (first attempt)"
						value={`${stats.correctFirstAttempt}/${stats.totalCards} (${accuracy}%)`}
					/>
					<StatRow label="Revision rounds" value={String(stats.revisionRounds)} />
					<StatRow label="Time" value={`${minutes}m ${seconds}s`} />
				</View>

				<Pressable style={styles.button} onPress={onNewSession}>
					<Text style={styles.buttonText}>New Session</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}

function StatRow({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.statRow}>
			<Text style={styles.statLabel}>{label}</Text>
			<Text style={styles.statValue}>{value}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		padding: spacing.lg,
	},
	title: {
		...typography.title,
		color: colors.text,
		textAlign: "center",
		marginBottom: spacing.xl,
	},
	statsCard: {
		backgroundColor: colors.surface,
		borderRadius: 16,
		padding: spacing.lg,
		marginBottom: spacing.xl,
	},
	statRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: spacing.sm,
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
		borderRadius: 12,
		paddingVertical: spacing.md,
		alignItems: "center",
	},
	buttonText: {
		...typography.body,
		color: colors.text,
		fontWeight: "700",
	},
});
