import type { Card } from "@german/core/types";
import { Box, Text, useInput } from "ink";
import { useState } from "react";

interface Props {
	card: Card;
	index: number;
	total: number;
	revisionRound?: number | undefined;
	onRight: () => void;
	onWrong: () => void;
	isStarred?: boolean | undefined;
	onToggleStar?: (() => void) | undefined;
}

export function Flashcard({
	card,
	index,
	total,
	revisionRound,
	onRight,
	onWrong,
	isStarred,
	onToggleStar,
}: Props) {
	const [revealed, setRevealed] = useState(false);
	const [showDetails, setShowDetails] = useState(false);

	useInput((input, key) => {
		if ((input === "s" || input === "S") && onToggleStar) {
			onToggleStar();
			return;
		}
		if (!revealed) {
			if (key.return || input === " ") {
				setRevealed(true);
			}
		} else {
			if (input === "r" || input === "R") {
				setRevealed(false);
				setShowDetails(false);
				onRight();
			} else if (input === "w" || input === "W") {
				setRevealed(false);
				setShowDetails(false);
				onWrong();
			} else if ((input === "d" || input === "D") && card.details) {
				setShowDetails((prev) => !prev);
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
			<Box>
				<Text dimColor>
					Card {index + 1}/{total}
				</Text>
				{isStarred != null && <Text color="yellow">{isStarred ? " ★" : " ☆"}</Text>}
				{card.level && <Text color="blue"> [{card.level}]</Text>}
			</Box>
			<Text> </Text>
			<Text bold>{card.question}</Text>
			{card.hint && <Text dimColor>({card.hint})</Text>}
			<Text> </Text>
			{revealed ? (
				<>
					<Text color="green">{card.answer}</Text>
					{card.example && <Text color="cyan">e.g. {card.example}</Text>}
					{showDetails && card.details && (
						<>
							<Text> </Text>
							<Text color="magenta">{card.details}</Text>
						</>
					)}
					<Text> </Text>
					<Text dimColor>
						[R] Right [W] Wrong{card.details ? " [D] Full conjugation" : ""}
						{onToggleStar ? ` [S] ${isStarred ? "Unstar" : "Star"}` : ""}
					</Text>
				</>
			) : (
				<Text dimColor>
					Press Enter to reveal answer
					{onToggleStar ? ` | [S] ${isStarred ? "Unstar" : "Star"}` : ""}
				</Text>
			)}
		</Box>
	);
}
