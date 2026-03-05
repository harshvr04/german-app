import type { Category, Level, VocabDirection } from "@german/core/types";
import { LEVELS } from "@german/core/types";
import { Box, Text, useInput } from "ink";
import { useState } from "react";

type Step = "level" | "category" | "vocabDirection" | "batchSize";

const CATEGORIES: Category[] = ["vocab", "verbs", "nouns", "adjectives"];
const VOCAB_DIRECTIONS: { value: VocabDirection; label: string }[] = [
	{ value: "de_to_en", label: "German → English" },
	{ value: "en_to_de", label: "English → German" },
];
const BATCH_SIZES = [10, 20, 50, 100];

// Level step: CEFR levels + "dictionary" at the bottom
const LEVEL_ITEMS: readonly string[] = [...LEVELS, "dictionary"];

interface Props {
	onComplete: (
		level: Level,
		category: Category,
		batchSize: number,
		vocabDirection?: VocabDirection,
	) => void;
	onDictionary: (level: Level) => void;
	onGlobalDictionary: () => void;
}

export function Setup({ onComplete, onDictionary, onGlobalDictionary }: Props) {
	const [step, setStep] = useState<Step>("level");
	const [cursor, setCursor] = useState(0);
	const [level, setLevel] = useState<Level | null>(null);
	const [category, setCategory] = useState<Category | null>(null);
	const [vocabDirection, setVocabDirection] = useState<VocabDirection | undefined>(undefined);

	// Category step shows CATEGORIES + "dictionary" at the bottom
	const categoryItems = [...CATEGORIES, "dictionary" as Category];

	const items =
		step === "level"
			? LEVEL_ITEMS
			: step === "category"
				? categoryItems
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

	useInput((_input, key) => {
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
				const selected = LEVEL_ITEMS[cursor]!;
				if (selected === "dictionary") {
					onGlobalDictionary();
					return;
				}
				setLevel(selected as Level);
				setStep("category");
				setCursor(0);
			} else if (step === "category") {
				const selected = categoryItems[cursor]!;
				if (selected === "dictionary") {
					onDictionary(level!);
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

	const title =
		step === "level"
			? "Select Level"
			: step === "category"
				? "Select Category"
				: step === "vocabDirection"
					? "Select Direction"
					: "Select Batch Size";

	return (
		<Box flexDirection="column" padding={1}>
			<Box>
				<Text bold underline>
					{title}
				</Text>
				{step !== "level" && <Text dimColor> ← back</Text>}
			</Box>
			<Text> </Text>
			{items.map((item, i) => {
				const isDictionary = item === "dictionary";
				return (
					<Text key={item}>
						{isDictionary && i > 0 ? "\n" : ""}
						{i === cursor ? "▸ " : "  "}
						{isDictionary ? (
							<Text bold={i === cursor} color="magenta" dimColor={step === "level"}>
								{item}
							</Text>
						) : (
							<Text bold={i === cursor}>{item}</Text>
						)}
					</Text>
				);
			})}
			<Text> </Text>
			<Text dimColor>
				↑/↓ to navigate, Enter to select{step !== "level" ? ", ←/Esc to go back" : ""}
			</Text>
		</Box>
	);
}
