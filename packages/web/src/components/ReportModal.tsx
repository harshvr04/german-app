import { useEffect, useRef, useState } from "react";
import { REPORT_WEBHOOK_URL } from "../config";

const ISSUE_TYPES = [
	"Spelling Mistake",
	"Conjugation Mistake",
	"Incorrect Example",
	"Wrong Translation",
	"Other",
] as const;

const RATE_LIMIT_KEY = "german-app-report-log";
const MAX_REPORTS_PER_DAY = 20;
const COOLDOWN_MS = 30_000;

function getReportLog(): number[] {
	try {
		return JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || "[]");
	} catch {
		return [];
	}
}

function addReportTimestamp(): void {
	const now = Date.now();
	const cutoff = now - 24 * 60 * 60 * 1000;
	const log = getReportLog().filter((t) => t > cutoff);
	log.push(now);
	localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(log));
}

function isDailyLimitReached(): boolean {
	const cutoff = Date.now() - 24 * 60 * 60 * 1000;
	return getReportLog().filter((t) => t > cutoff).length >= MAX_REPORTS_PER_DAY;
}

function isInCooldown(): boolean {
	const log = getReportLog();
	if (log.length === 0) return false;
	return Date.now() - (log[log.length - 1] as number) < COOLDOWN_MS;
}

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
	const [cooldown, setCooldown] = useState(false);
	const abortRef = useRef<AbortController | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!visible) {
			abortRef.current?.abort();
			abortRef.current = null;
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		} else {
			setCooldown(isInCooldown());
		}
		return () => {
			abortRef.current?.abort();
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [visible]);

	// Tick cooldown timer
	useEffect(() => {
		if (!visible || !cooldown) return;
		const interval = setInterval(() => {
			if (!isInCooldown()) {
				setCooldown(false);
				clearInterval(interval);
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [visible, cooldown]);

	if (!visible) return null;

	const dailyLimitReached = isDailyLimitReached();
	const isOther = selectedType === "Other";
	const commentRequired = isOther && comment.trim().length === 0;

	const handleSubmit = async () => {
		if (!selectedType || commentRequired || cooldown || dailyLimitReached) return;
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;
		setSent(true);
		try {
			await fetch(REPORT_WEBHOOK_URL, {
				method: "POST",
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
		addReportTimestamp();
		setCooldown(true);
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
		<div
			className="modal-overlay"
			onClick={handleClose}
			onKeyDown={(e) => e.key === "Escape" && handleClose()}
		>
			<div
				className="modal-card"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				{dailyLimitReached ? (
					<>
						<div className="failed-text">Daily report limit reached (20/day)</div>
						<button className="modal-cancel" type="button" onClick={handleClose}>
							Close
						</button>
					</>
				) : sent ? (
					<div className="sent-text">Sent!</div>
				) : failed ? (
					<>
						<div className="failed-text">No connection</div>
						<button
							className="modal-submit"
							type="button"
							onClick={() => {
								setFailed(false);
								handleSubmit();
							}}
						>
							Retry
						</button>
						<button className="modal-cancel" type="button" onClick={handleClose}>
							Close
						</button>
					</>
				) : cooldown ? (
					<>
						<div className="modal-subtitle" style={{ textAlign: "center", padding: "16px 0" }}>
							Please wait before submitting another report
						</div>
						<button className="modal-cancel" type="button" onClick={handleClose}>
							Close
						</button>
					</>
				) : selectedType ? (
					<>
						<div className="modal-title">Add a comment</div>
						<div className="modal-subtitle">{selectedType}</div>
						<textarea
							className="modal-input"
							placeholder={
								isOther ? "Describe the issue (max 50 words)" : "Optional details (max 50 words)"
							}
							value={comment}
							onChange={(e) => {
								const words = e.target.value.split(/\s+/).filter(Boolean);
								if (words.length <= 50) setComment(e.target.value);
							}}
							maxLength={300}
						/>
						<button
							className="modal-submit"
							type="button"
							onClick={handleSubmit}
							disabled={commentRequired}
						>
							Submit
						</button>
						<button className="modal-cancel" type="button" onClick={() => setSelectedType(null)}>
							Back
						</button>
					</>
				) : (
					<>
						<div className="modal-title">Report Issue</div>
						<div className="modal-subtitle">{word}</div>
						{ISSUE_TYPES.map((type) => (
							<button
								key={type}
								className="modal-option"
								type="button"
								onClick={() => setSelectedType(type)}
							>
								{type}
							</button>
						))}
						<button className="modal-cancel" type="button" onClick={handleClose}>
							Cancel
						</button>
					</>
				)}
			</div>
		</div>
	);
}
