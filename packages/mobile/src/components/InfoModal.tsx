import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme";

interface Props {
	visible: boolean;
	onClose: () => void;
	onReset: () => void;
	message: string;
}

export function InfoModal({ visible, onClose, onReset, message }: Props) {
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<Pressable style={styles.overlay} onPress={onClose}>
				<View style={styles.card} onStartShouldSetResponder={() => true}>
					<Text style={styles.title}>Words Encountered</Text>
					<Text style={styles.body}>{message}</Text>
					<Pressable style={styles.resetButton} onPress={onReset}>
						<Text style={styles.resetText}>Reset Counter</Text>
					</Pressable>
					<Pressable style={styles.closeButton} onPress={onClose}>
						<Text style={styles.closeText}>Close</Text>
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
	card: {
		backgroundColor: colors.surface,
		borderRadius: 16,
		padding: spacing.lg,
		width: "100%",
		maxWidth: 340,
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
		lineHeight: 20,
		marginBottom: spacing.lg,
	},
	resetButton: {
		backgroundColor: colors.accent,
		borderRadius: 8,
		paddingVertical: spacing.sm,
		alignItems: "center",
		marginBottom: spacing.sm,
	},
	resetText: {
		...typography.caption,
		color: colors.text,
		fontWeight: "600",
	},
	closeButton: {
		paddingVertical: spacing.sm,
		alignItems: "center",
	},
	closeText: {
		...typography.caption,
		color: colors.textSecondary,
	},
});
