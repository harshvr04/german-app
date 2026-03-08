import type { Category, Level, VocabDirection } from "@german/core/types";
import {
	BATCH_SIZES,
	CATEGORIES,
	LEVELS,
	STEP_TITLES,
	VOCAB_DIRECTIONS,
	WORD_COUNTER_INFO,
} from "@german/core/types";
import { Box, Text, useInput } from "ink";
import { useState } from "react";

type Step = "level" | "category" | "vocabDirection" | "batchSize";

interface WordCount {
	count: number;
	total: number;
}

interface Props {
	onComplete: (
		level: Level,
		category: Category,
		batchSize: number,
		vocabDirection?: VocabDirection,
	) => void;
	onDictionary: (level: Level) => void;
	onGlobalDictionary: () => void;
	onStarredReview: (level: Level) => void;
	onGlobalStarredReview: () => void;
	starredCount: number;
	starredCountByLevel: Record<Level, number>;
	wordCounts: Record<Level, WordCount>;
	onResetCounter: (level: Level) => void;
}

export function Setup({
	onComplete,
	onDictionary,
	onGlobalDictionary,
	onStarredReview,
	onGlobalStarredReview,
	starredCount,
	starredCountByLevel,
	wordCounts,
	onResetCounter,
}: Props) {
	const [step, setStep] = useState<Step>("level");
	const [cursor, setCursor] = useState(0);
	const [level, setLevel] = useState<Level | null>(null);
	const [category, setCategory] = useState<Category | null>(null);
	const [vocabDirection, setVocabDirection] = useState<VocabDirection | undefined>(undefined);
	const [showInfo, setShowInfo] = useState(false);

	// Level step: CEFR levels + "dictionary" + optionally "starred"
	const levelItems: string[] = [...LEVELS, "dictionary"];
	if (starredCount > 0) levelItems.push("starred");

	// Category step: CATEGORIES + "dictionary" + optionally "starred"
	const categoryValues: Category[] = [...CATEGORIES.map((c) => c.value), "dictionary"];
	if (level && starredCountByLevel[level] > 0) categoryValues.push("starred");

	const items =
		step === "level"
			? levelItems
			: step === "category"
				? categoryValues
				: step === "vocabDirection"
					? VOCAB_DIRECTIONS.map((d) => d.label)
					: BATCH_SIZES.map(String);

	const goBack = () => {
		if (step === "category") {
			setLevel(null);
			setStep("level");
			setCursor(0);
		} else if (step === "vocabDirection") {
			setCategory(null);
			setStep("category");
			setCursor(0);
		} else if (step === "batchSize") {
			if (category === "vocab" && vocabDirection) {
				setVocabDirection(undefined);
				setStep("vocabDirection");
			} else {
				setCategory(null);
				setStep("category");
			}
			setCursor(0);
		}
	};

	const totalCount = LEVELS.reduce(
		(acc, l) => {
			const wc = wordCounts[l];
			return { count: acc.count + wc.count, total: acc.total + wc.total };
		},
		{ count: 0, total: 0 },
	);

	useInput((input, key) => {
		if (showInfo) {
			if (input === "r") {
				if (step === "level") {
					for (const l of LEVELS) {
						onResetCounter(l);
					}
				} else if (level) {
					onResetCounter(level);
				}
				setShowInfo(false);
			} else {
				setShowInfo(false);
			}
			return;
		}
		if (input === "i") {
			if (step === "level" && totalCount.total > 0) {
				setShowInfo(true);
			} else if (step === "category" && level) {
				setShowInfo(true);
			}
			return;
		}
		if (key.upArrow) {
			setCursor((c) => (c > 0 ? c - 1 : items.length - 1));
		} else if (key.downArrow) {
			setCursor((c) => (c < items.length - 1 ? c + 1 : 0));
		} else if (key.escape || key.leftArrow) {
			if (step !== "level") {
				goBack();
			}
		} else if (key.return) {
			if (step === "level") {
				const selected = levelItems[cursor]!;
				if (selected === "dictionary") {
					onGlobalDictionary();
					return;
				}
				if (selected === "starred") {
					onGlobalStarredReview();
					return;
				}
				setLevel(selected as Level);
				setStep("category");
				setCursor(0);
			} else if (step === "category") {
				const selected = categoryValues[cursor]!;
				if (selected === "dictionary") {
					onDictionary(level!);
					return;
				}
				if (selected === "starred") {
					onStarredReview(level!);
					return;
				}
				setCategory(selected);
				if (selected === "vocab") {
					setStep("vocabDirection");
				} else {
					setStep("batchSize");
				}
				setCursor(0);
			} else if (step === "vocabDirection") {
				setVocabDirection(VOCAB_DIRECTIONS[cursor]!.value);
				setStep("batchSize");
				setCursor(0);
			} else {
				onComplete(level!, category!, BATCH_SIZES[cursor]!, vocabDirection);
			}
		}
	});

	const title = STEP_TITLES[step];

	if (showInfo) {
		const wc = step === "level" ? totalCount : wordCounts[level!];
		const label = step === "level" ? "All Levels" : level!;
		return (
			<Box flexDirection="column" padding={1}>
				<Text bold>Words Encountered ({label})</Text>
				<Text> </Text>
				<Text>
					{wc.count}/{wc.total} unique words seen
				</Text>
				<Text> </Text>
				<Text dimColor>
					{step === "level" ? WORD_COUNTER_INFO.allLevels : WORD_COUNTER_INFO.level}
				</Text>
				<Text> </Text>
				<Text dimColor>Press r to reset, any other key to close</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" padding={1}>
			<Box>
				<Text bold underline>
					{title}
				</Text>
				{step !== "level" && level && wordCounts[level].total > 0 && (
					<Text dimColor>
						{" "}
						{wordCounts[level].count}/{wordCounts[level].total} <Text color="cyan">(i)</Text>
					</Text>
				)}
				{step !== "level" && <Text dimColor> ← back</Text>}
			</Box>
			<Text> </Text>
			{items.map((item, i) => {
				const isSpecial = item === "dictionary" || item === "starred";
				const isFirst = i === 0;
				const prevIsSpecial =
					i > 0 && (items[i - 1] === "dictionary" || items[i - 1] === "starred");
				const needsSpacer = isSpecial && !prevIsSpecial && !isFirst;
				return (
					<Text key={item}>
						{needsSpacer ? "\n" : ""}
						{i === cursor ? "▸ " : "  "}
						{item === "dictionary" ? (
							<Text bold={i === cursor} color="magenta" dimColor={step === "level"}>
								{item}
							</Text>
						) : item === "starred" ? (
							<Text bold={i === cursor} color="yellow">
								★ starred ({step === "level" ? starredCount : starredCountByLevel[level!]})
							</Text>
						) : (
							<Text bold={i === cursor}>{item}</Text>
						)}
					</Text>
				);
			})}
			{step === "level" && totalCount.total > 0 && (
				<>
					<Text> </Text>
					<Text dimColor>
						{"  "}
						{totalCount.count}/{totalCount.total} <Text color="cyan">(i)</Text>
					</Text>
				</>
			)}
			<Text> </Text>
			<Text dimColor>
				↑/↓ to navigate, Enter to select{step !== "level" ? ", ←/Esc to go back" : ""}
			</Text>
		</Box>
	);
}
