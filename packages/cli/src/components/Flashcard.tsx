import type { Card } from "@german/core/types";
import { Box, Text, useInput } from "ink";
import { useState } from "react";

interface Props {
	card: Card;
	index: number;
	total: number;
	revisionRound?: number;
	onRight: () => void;
	onWrong: () => void;
}

export function Flashcard({ card, index, total, revisionRound, onRight, onWrong }: Props) {
	const [revealed, setRevealed] = useState(false);

	useInput((input, key) => {
		if (!revealed) {
			if (key.return || input === " ") {
				setRevealed(true);
			}
		} else {
			if (input === "r" || input === "R") {
				setRevealed(false);
				onRight();
			} else if (input === "w" || input === "W") {
				setRevealed(false);
				onWrong();
			}
		}
	});

	return (
		<Box flexDirection="column" padding={1}>
			{revisionRound != null && (
				<Text color="yellow" bold>
					Revision Round {revisionRound}
				</Text>
			)}
			<Text dimColor>
				Card {index + 1}/{total}
			</Text>
			<Text> </Text>
			<Text bold>{card.question}</Text>
			{card.hint && <Text dimColor>({card.hint})</Text>}
			<Text> </Text>
			{revealed ? (
				<>
					<Text color="green">{card.answer}</Text>
					<Text> </Text>
					<Text dimColor>[R] Right [W] Wrong</Text>
				</>
			) : (
				<Text dimColor>Press Enter to reveal answer</Text>
			)}
		</Box>
	);
}
