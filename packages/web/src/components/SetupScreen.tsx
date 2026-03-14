import {
	BATCH_SIZES,
	CATEGORIES,
	LEVELS,
	STEP_TITLES,
	VOCAB_DIRECTIONS,
	WORD_COUNTER_INFO,
} from "@german/core/types";
import type { Category, Level, SessionConfig, VocabDirection } from "@german/core/types";
import { useState } from "react";
import { hasDataForLevel } from "../data/loader";
import { InfoModal } from "./InfoModal";

type Step = "level" | "category" | "vocabDirection" | "batchSize";

interface WordCount {
	count: number;
	total: number;
}

interface Props {
	onComplete: (config: SessionConfig) => void;
	onDictionary: (level: Level) => void;
	onGlobalDictionary: () => void;
	onVerbDictionary: (level: Level) => void;
	onGlobalVerbDictionary: () => void;
	onStarredReview: (level: Level) => void;
	onGlobalStarredReview: () => void;
	starredCount: number;
	starredCountByLevel: Record<Level, number>;
	wordCounts: Record<Level, WordCount>;
	onResetCounter: (level: Level) => void;
}

export function SetupScreen({
	onComplete,
	onDictionary,
	onGlobalDictionary,
	onVerbDictionary,
	onGlobalVerbDictionary,
	onStarredReview,
	onGlobalStarredReview,
	starredCount,
	starredCountByLevel,
	wordCounts,
	onResetCounter,
}: Props) {
	const [step, setStep] = useState<Step>("level");
	const [level, setLevel] = useState<Level | null>(null);
	const [category, setCategory] = useState<Category | null>(null);
	const [vocabDirection, setVocabDirection] = useState<VocabDirection | undefined>(undefined);
	const [infoModalVisible, setInfoModalVisible] = useState(false);

	const totalCount = LEVELS.reduce(
		(acc, l) => {
			const wc = wordCounts[l];
			return { count: acc.count + wc.count, total: acc.total + wc.total };
		},
		{ count: 0, total: 0 },
	);

	const goBack = () => {
		if (step === "category") {
			setLevel(null);
			setStep("level");
		} else if (step === "vocabDirection") {
			setCategory(null);
			setStep("category");
		} else if (step === "batchSize") {
			if (category === "vocab" && vocabDirection) {
				setVocabDirection(undefined);
				setStep("vocabDirection");
			} else {
				setCategory(null);
				setStep("category");
			}
		}
	};

	const title = STEP_TITLES[step];

	const breadcrumbs = [
		level,
		category && CATEGORIES.find((c) => c.value === category)?.label,
		vocabDirection && VOCAB_DIRECTIONS.find((d) => d.value === vocabDirection)?.label,
	].filter(Boolean);

	return (
		<div className="screen">
			<div className="header">
				<div className="header-row">
					<div className="app-title">German Practice</div>
					{step !== "level" && (
						<button className="back-btn" type="button" onClick={goBack}>
							←
						</button>
					)}
				</div>
				{breadcrumbs.length > 0 && (
					<div className="breadcrumb-row">
						<span className="breadcrumbs">{breadcrumbs.join(" › ")}</span>
						{level && step !== "level" && wordCounts[level].total > 0 && (
							<div className="counter-row">
								<span className="counter-text">
									{wordCounts[level].count}/{wordCounts[level].total}
								</span>
								<button
									className="info-icon"
									type="button"
									onClick={() => setInfoModalVisible(true)}
								>
									(i)
								</button>
							</div>
						)}
					</div>
				)}
			</div>

			<div className="section-title">{title}</div>

			<div className="scroll-list">
				{step === "level" && (
					<>
						{LEVELS.map((l) => {
							const available = hasDataForLevel(l);
							return (
								<button
									key={l}
									className="option"
									type="button"
									disabled={!available}
									onClick={() => {
										setLevel(l);
										setStep("category");
									}}
								>
									<span>{l}</span>
									{!available && <span className="coming-soon">Coming soon</span>}
								</button>
							);
						})}
						{totalCount.total > 0 && (
							<div className="global-counter-row">
								<span className="counter-text">
									{totalCount.count}/{totalCount.total}
								</span>
								<button
									className="info-icon"
									type="button"
									onClick={() => setInfoModalVisible(true)}
								>
									(i)
								</button>
							</div>
						)}
						<div className="spacer-xl" />
						<button className="global-link" type="button" onClick={onGlobalDictionary}>
							Dictionary
						</button>
						<button className="global-link" type="button" onClick={onGlobalVerbDictionary}>
							Verb Conjugations
						</button>
						{starredCount > 0 && (
							<button className="global-starred" type="button" onClick={onGlobalStarredReview}>
								★ Starred ({starredCount})
							</button>
						)}
						<div className="spacer-xl" />
						<button
							className="credit-text"
							type="button"
							onClick={() =>
								window.alert(
									"This App was vibe-coded by Harshvardhan Rao.\n\nReachout to me on Linkedin: harshvardhan-rao-03549760",
								)
							}
						>
							credits
						</button>
					</>
				)}

				{step === "category" && (
					<>
						{CATEGORIES.map((c) => (
							<button
								key={c.value}
								className="option"
								type="button"
								onClick={() => {
									setCategory(c.value);
									if (c.value === "vocab") {
										setStep("vocabDirection");
									} else {
										setStep("batchSize");
									}
								}}
							>
								{c.label}
							</button>
						))}
						{level === "B2" && (
							<div className="b2-note">
								B2 adds only distinctly new words. Verbs include all A1–B2 words.
							</div>
						)}
						<div className="spacer-md" />
						<button
							className="dict-option"
							type="button"
							onClick={() => level && onDictionary(level)}
						>
							Dictionary
						</button>
						<button
							className="dict-option"
							type="button"
							onClick={() => level && onVerbDictionary(level)}
						>
							Verb Conjugations
						</button>
						{level && starredCountByLevel[level] > 0 && (
							<button
								className="dict-option"
								type="button"
								style={{ borderColor: "#f0a500", color: "#f0a500" }}
								onClick={() => onStarredReview(level)}
							>
								★ Starred ({starredCountByLevel[level]})
							</button>
						)}
					</>
				)}

				{step === "vocabDirection" &&
					VOCAB_DIRECTIONS.map((d) => (
						<button
							key={d.value}
							className="option"
							type="button"
							onClick={() => {
								setVocabDirection(d.value);
								setStep("batchSize");
							}}
						>
							{d.label}
						</button>
					))}

				{step === "batchSize" &&
					BATCH_SIZES.map((size) => (
						<button
							key={size}
							className="option"
							type="button"
							onClick={() => {
								onComplete({
									level: level as Level,
									category: category as Category,
									batchSize: size,
									vocabDirection,
								});
							}}
						>
							{size} cards
						</button>
					))}
			</div>

			<InfoModal
				visible={infoModalVisible}
				onClose={() => setInfoModalVisible(false)}
				message={step === "level" ? WORD_COUNTER_INFO.allLevels : WORD_COUNTER_INFO.level}
				onReset={() => {
					if (step === "level") {
						for (const l of LEVELS) {
							onResetCounter(l);
						}
					} else if (level) {
						onResetCounter(level);
					}
					setInfoModalVisible(false);
				}}
			/>
		</div>
	);
}
