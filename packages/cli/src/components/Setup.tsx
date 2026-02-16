import type { Category, Level } from "@german/core/types";
import { LEVELS } from "@german/core/types";
import { Box, Text, useInput } from "ink";
import { useState } from "react";

type Step = "level" | "category" | "batchSize";

const CATEGORIES: Category[] = ["vocab", "verbs", "nouns", "adjectives"];
const BATCH_SIZES = [10, 20, 50, 100];

interface Props {
	onComplete: (level: Level, category: Category, batchSize: number) => void;
}

export function Setup({ onComplete }: Props) {
	const [step, setStep] = useState<Step>("level");
	const [cursor, setCursor] = useState(0);
	const [level, setLevel] = useState<Level | null>(null);
	const [category, setCategory] = useState<Category | null>(null);

	const items =
		step === "level"
			? (LEVELS as readonly string[])
			: step === "category"
				? CATEGORIES
				: BATCH_SIZES.map(String);

	useInput((_input, key) => {
		if (key.upArrow) {
			setCursor((c) => (c > 0 ? c - 1 : items.length - 1));
		} else if (key.downArrow) {
			setCursor((c) => (c < items.length - 1 ? c + 1 : 0));
		} else if (key.return) {
			if (step === "level") {
				setLevel(LEVELS[cursor]!);
				setStep("category");
				setCursor(0);
			} else if (step === "category") {
				setCategory(CATEGORIES[cursor]!);
				setStep("batchSize");
				setCursor(0);
			} else {
				onComplete(level!, category!, BATCH_SIZES[cursor]!);
			}
		}
	});

	const title =
		step === "level"
			? "Select Level"
			: step === "category"
				? "Select Category"
				: "Select Batch Size";

	return (
		<Box flexDirection="column" padding={1}>
			<Text bold underline>
				{title}
			</Text>
			<Text> </Text>
			{items.map((item, i) => (
				<Text key={item}>
					{i === cursor ? "▸ " : "  "}
					<Text bold={i === cursor}>{item}</Text>
				</Text>
			))}
			<Text> </Text>
			<Text dimColor>↑/↓ to navigate, Enter to select</Text>
		</Box>
	);
}
