import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { REPORT_WEBHOOK_URL } from "../config";
import { scale, spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";

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
	const { colors } = useTheme();
	const [sent, setSent] = useState(false);
	const [failed, setFailed] = useState(false);
	const [selectedType, setSelectedType] = useState<string | null>(null);
	const [comment, setComment] = useState("");
	const abortRef = useRef<AbortController | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Cleanup fetch and timers on unmount or when modal closes
	useEffect(() => {
		if (!visible) {
			abortRef.current?.abort();
			abortRef.current = null;
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		}
		return () => {
			abortRef.current?.abort();
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [visible]);

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
					marginBottom: spacing.xs,
				},
				subtitle: {
					...typography.caption,
					color: colors.textSecondary,
					marginBottom: spacing.md,
				},
				option: {
					backgroundColor: colors.primary,
					borderRadius: scale(8),
					paddingVertical: spacing.sm + scale(4),
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
					borderRadius: scale(8),
					borderWidth: 1,
					borderColor: colors.border,
					color: colors.text,
					...typography.caption,
					padding: spacing.sm,
					minHeight: scale(60),
					textAlignVertical: "top",
					marginBottom: spacing.md,
				},
				submitButton: {
					backgroundColor: colors.accent,
					borderRadius: scale(8),
					paddingVertical: spacing.sm + scale(4),
					alignItems: "center",
					marginBottom: spacing.sm,
				},
				submitText: {
					...typography.body,
					color: "#FFFFFF",
					fontWeight: "600",
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
			}),
		[colors],
	);

	const handleSelect = (issueType: string) => {
		setSelectedType(issueType);
	};

	const isOther = selectedType === "Other";
	const commentRequired = isOther && comment.trim().length === 0;

	const handleSubmit = async () => {
		if (!selectedType || commentRequired) return;
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;
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
				signal: controller.signal,
			});
		} catch {
			if (controller.signal.aborted) return;
			setSent(false);
			setFailed(true);
			return;
		}
		timerRef.current = setTimeout(() => {
			timerRef.current = null;
			setSent(false);
			setSelectedType(null);
			setComment("");
			onClose();
		}, 600);
	};

	const handleClose = () => {
		abortRef.current?.abort();
		abortRef.current = null;
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		setSent(false);
		setFailed(false);
		setSelectedType(null);
		setComment("");
		onClose();
	};

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
			<Pressable style={styles.overlay} onPress={handleClose}>
				<View style={themed.card} onStartShouldSetResponder={() => true}>
					{sent ? (
						<Text style={themed.sentText}>Sent!</Text>
					) : failed ? (
						<>
							<Text style={themed.failedText}>No connection</Text>
							<Pressable
								style={themed.submitButton}
								onPress={() => {
									setFailed(false);
									handleSubmit();
								}}
							>
								<Text style={themed.submitText}>Retry</Text>
							</Pressable>
							<Pressable style={styles.cancelButton} onPress={handleClose}>
								<Text style={themed.cancelText}>Close</Text>
							</Pressable>
						</>
					) : selectedType ? (
						<>
							<Text style={themed.title}>Add a comment</Text>
							<Text style={themed.subtitle}>{selectedType}</Text>
							<TextInput
								style={themed.commentInput}
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
								style={[themed.submitButton, commentRequired && styles.submitButtonDisabled]}
								onPress={handleSubmit}
								disabled={commentRequired}
							>
								<Text style={themed.submitText}>Submit</Text>
							</Pressable>
							<Pressable style={styles.cancelButton} onPress={() => setSelectedType(null)}>
								<Text style={themed.cancelText}>Back</Text>
							</Pressable>
						</>
					) : (
						<>
							<Text style={themed.title}>Report Issue</Text>
							<Text style={themed.subtitle}>{word}</Text>
							{ISSUE_TYPES.map((type) => (
								<Pressable key={type} style={themed.option} onPress={() => handleSelect(type)}>
									<Text style={themed.optionText}>{type}</Text>
								</Pressable>
							))}
							<Pressable style={styles.cancelButton} onPress={handleClose}>
								<Text style={themed.cancelText}>Cancel</Text>
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
	submitButtonDisabled: {
		opacity: 0.4,
	},
	cancelButton: {
		paddingVertical: spacing.sm,
		alignItems: "center",
		marginTop: spacing.xs,
	},
});
