import type { Card } from "@german/core/types";
import { useEffect, useState } from "react";
import { REPORT_WEBHOOK_URL } from "../config";
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
	const [revealed, setRevealed] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [reportModalVisible, setReportModalVisible] = useState(false);

	// Reset when card changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset on card index change only
	useEffect(() => {
		setRevealed(false);
		setShowDetails(false);
	}, [index]);

	// Keyboard shortcuts
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (reportModalVisible) return;
			if (e.key === " " || e.key === "Enter") {
				e.preventDefault();
				if (!revealed) {
					setRevealed(true);
				}
			} else if (revealed && (e.key === "ArrowRight" || e.key === "g")) {
				onRight();
			} else if (revealed && (e.key === "ArrowLeft" || e.key === "w")) {
				onWrong();
			} else if (e.key === "d" && revealed && card.details) {
				setShowDetails((prev) => !prev);
			} else if (e.key === "Escape") {
				onBack();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [revealed, reportModalVisible, onRight, onWrong, onBack, card.details]);

	const progress = (index + 1) / total;

	return (
		<div className="screen">
			<div className="header">
				{revisionRound != null && (
					<div className="revision-banner">Revision Round {revisionRound}</div>
				)}
				<div className="header-row">
					<div className="header-left">
						<span className="progress-text">
							Card {index + 1} / {total}
						</span>
						{card.level && <span className="level-badge">{card.level}</span>}
					</div>
					<div className="header-right">
						{isStarred != null && onToggleStar && (
							<button
								className={`star-btn ${isStarred ? "active" : ""}`}
								type="button"
								onClick={onToggleStar}
							>
								{isStarred ? "★" : "☆"}
							</button>
						)}
						<button className="close-btn" type="button" onClick={onBack}>
							✕
						</button>
					</div>
				</div>
				<div className="progress-bar-container">
					<div className="progress-bar" style={{ width: `${progress * 100}%` }} />
				</div>
			</div>

			<div className="scroll-list" style={{ display: "flex", flexDirection: "column" }}>
				<div
					className="card"
					onClick={() => !revealed && setRevealed(true)}
					onKeyDown={(e) => !revealed && e.key === "Enter" && setRevealed(true)}
				>
					<div className="question">{card.question}</div>
					{card.hint && <div className="hint">{card.hint}</div>}

					{revealed ? (
						<div style={{ marginTop: 16 }}>
							<div className="divider" />
							<div className="answer">{card.answer}</div>
							{card.example && <div className="example">e.g. {card.example}</div>}
						</div>
					) : (
						<div className="tap-prompt">Click to reveal answer</div>
					)}
				</div>

				{revealed && card.details && (
					<>
						<button
							className="details-toggle"
							type="button"
							onClick={() => setShowDetails((prev) => !prev)}
						>
							{showDetails ? "Hide details" : "Additional details"}
						</button>
						{showDetails && (
							<div className="details-box">
								<div className="details-text">{card.details}</div>
							</div>
						)}
					</>
				)}

				{REPORT_WEBHOOK_URL.length > 0 && (
					<button className="report-btn" type="button" onClick={() => setReportModalVisible(true)}>
						Report issue
					</button>
				)}
			</div>

			<ReportModal
				visible={reportModalVisible}
				onClose={() => setReportModalVisible(false)}
				word={card.question}
				level={card.level ?? sessionLevel ?? ""}
				category={category ?? ""}
			/>

			{revealed && (
				<div className="action-buttons">
					<button className="btn-wrong" type="button" onClick={onWrong}>
						✗ Wrong
					</button>
					<button className="btn-right" type="button" onClick={onRight}>
						✓ Got it
					</button>
				</div>
			)}
		</div>
	);
}
