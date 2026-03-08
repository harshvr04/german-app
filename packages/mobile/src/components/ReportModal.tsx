import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { REPORT_WEBHOOK_URL } from "../config";
import { colors, spacing, typography } from "../theme";

const ISSUE_TYPES = [
	"Spelling Mistake",
	"Conjugation Mistake",
	"Incorrect Example",
	"Wrong Translation",
	"Other",
] as const;

interface Props {
	visible: boolean;
	onClose: () => void;
	word: string;
	level: string;
	category: string;
}

export function ReportModal({ visible, onClose, word, level, category }: Props) {
	const [sent, setSent] = useState(false);
	const [failed, setFailed] = useState(false);
	const [selectedType, setSelectedType] = useState<string | null>(null);
	const [comment, setComment] = useState("");

	const handleSelect = (issueType: string) => {
		setSelectedType(issueType);
	};

	const isOther = selectedType === "Other";
	const commentRequired = isOther && comment.trim().length === 0;

	const handleSubmit = async () => {
		if (!selectedType || commentRequired) return;
		setSent(true);
		try {
			await fetch(REPORT_WEBHOOK_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					word,
					level,
					category,
					issueType: selectedType,
					comment: comment.trim() || "",
					timestamp: new Date().toISOString(),
				}),
			});
		} catch {
			setSent(false);
			setFailed(true);
			return;
		}
		setTimeout(() => {
			setSent(false);
			setSelectedType(null);
			setComment("");
			onClose();
		}, 600);
	};

	const handleClose = () => {
		setSent(false);
		setFailed(false);
		setSelectedType(null);
		setComment("");
		onClose();
	};

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
			<Pressable style={styles.overlay} onPress={handleClose}>
				<View style={styles.card} onStartShouldSetResponder={() => true}>
					{sent ? (
						<Text style={styles.sentText}>Sent!</Text>
					) : failed ? (
						<>
							<Text style={styles.failedText}>No connection</Text>
							<Pressable
								style={styles.submitButton}
								onPress={() => {
									setFailed(false);
									handleSubmit();
								}}
							>
								<Text style={styles.submitText}>Retry</Text>
							</Pressable>
							<Pressable style={styles.cancelButton} onPress={handleClose}>
								<Text style={styles.cancelText}>Close</Text>
							</Pressable>
						</>
					) : selectedType ? (
						<>
							<Text style={styles.title}>Add a comment</Text>
							<Text style={styles.subtitle}>{selectedType}</Text>
							<TextInput
								style={styles.commentInput}
								placeholder={
									isOther ? "Describe the issue (max 50 words)" : "Optional details (max 50 words)"
								}
								placeholderTextColor={colors.textDisabled}
								value={comment}
								onChangeText={(text) => {
									const words = text.split(/\s+/).filter(Boolean);
									if (words.length <= 50) setComment(text);
								}}
								multiline
								maxLength={300}
							/>
							<Pressable
								style={[styles.submitButton, commentRequired && styles.submitButtonDisabled]}
								onPress={handleSubmit}
								disabled={commentRequired}
							>
								<Text style={styles.submitText}>Submit</Text>
							</Pressable>
							<Pressable style={styles.cancelButton} onPress={() => setSelectedType(null)}>
								<Text style={styles.cancelText}>Back</Text>
							</Pressable>
						</>
					) : (
						<>
							<Text style={styles.title}>Report Issue</Text>
							<Text style={styles.subtitle}>{word}</Text>
							{ISSUE_TYPES.map((type) => (
								<Pressable key={type} style={styles.option} onPress={() => handleSelect(type)}>
									<Text style={styles.optionText}>{type}</Text>
								</Pressable>
							))}
							<Pressable style={styles.cancelButton} onPress={handleClose}>
								<Text style={styles.cancelText}>Cancel</Text>
							</Pressable>
						</>
					)}
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
		marginBottom: spacing.xs,
	},
	subtitle: {
		...typography.caption,
		color: colors.textSecondary,
		marginBottom: spacing.md,
	},
	option: {
		backgroundColor: colors.primary,
		borderRadius: 8,
		paddingVertical: spacing.sm + 4,
		paddingHorizontal: spacing.md,
		marginBottom: spacing.sm,
	},
	optionText: {
		...typography.body,
		color: colors.text,
		textAlign: "center",
	},
	commentInput: {
		backgroundColor: colors.background,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.border,
		color: colors.text,
		...typography.caption,
		padding: spacing.sm,
		minHeight: 60,
		textAlignVertical: "top",
		marginBottom: spacing.md,
	},
	submitButton: {
		backgroundColor: colors.accent,
		borderRadius: 8,
		paddingVertical: spacing.sm + 4,
		alignItems: "center",
		marginBottom: spacing.sm,
	},
	submitButtonDisabled: {
		opacity: 0.4,
	},
	submitText: {
		...typography.body,
		color: colors.text,
		fontWeight: "600",
	},
	cancelButton: {
		paddingVertical: spacing.sm,
		alignItems: "center",
		marginTop: spacing.xs,
	},
	cancelText: {
		...typography.caption,
		color: colors.textSecondary,
	},
	sentText: {
		...typography.title,
		color: colors.correct,
		textAlign: "center",
		paddingVertical: spacing.lg,
	},
	failedText: {
		...typography.body,
		color: colors.wrong,
		textAlign: "center",
		paddingVertical: spacing.md,
	},
});
