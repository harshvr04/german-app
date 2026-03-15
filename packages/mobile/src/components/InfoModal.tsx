import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { scale, spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";

interface Props {
	visible: boolean;
	onClose: () => void;
	onReset: () => void;
	message: string;
}

export function InfoModal({ visible, onClose, onReset, message }: Props) {
	const { colors } = useTheme();

	const themed = useMemo(
		() =>
			StyleSheet.create({
				card: {
					backgroundColor: colors.surface,
					borderRadius: scale(16),
					padding: spacing.lg,
					width: "100%",
					maxWidth: scale(340),
					borderWidth: 1,
					borderColor: colors.border,
				},
				title: {
					...typography.title,
					color: colors.text,
					marginBottom: spacing.md,
				},
				body: {
					...typography.caption,
					color: colors.textSecondary,
					lineHeight: scale(20),
					marginBottom: spacing.lg,
				},
				resetButton: {
					backgroundColor: colors.accent,
					borderRadius: scale(8),
					paddingVertical: spacing.sm,
					alignItems: "center",
					marginBottom: spacing.sm,
				},
				resetText: {
					...typography.caption,
					color: "#FFFFFF",
					fontWeight: "600",
				},
				closeText: {
					...typography.caption,
					color: colors.textSecondary,
				},
			}),
		[colors],
	);

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<Pressable style={styles.overlay} onPress={onClose}>
				<View style={themed.card} onStartShouldSetResponder={() => true}>
					<Text style={themed.title}>Words Encountered</Text>
					<Text style={themed.body}>{message}</Text>
					<Pressable style={themed.resetButton} onPress={onReset}>
						<Text style={themed.resetText}>Reset Counter</Text>
					</Pressable>
					<Pressable style={styles.closeButton} onPress={onClose}>
						<Text style={themed.closeText}>Close</Text>
					</Pressable>
				</View>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.7)",
		justifyContent: "center",
		alignItems: "center",
		padding: spacing.lg,
	},
	closeButton: {
		paddingVertical: spacing.sm,
		alignItems: "center",
	},
});
