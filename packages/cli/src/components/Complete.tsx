import type { SessionStats } from "@german/core/types";
import { Box, Text, useInput } from "ink";

interface Props {
	stats: SessionStats;
	onExit: () => void;
}

export function Complete({ stats, onExit }: Props) {
	useInput(() => {
		onExit();
	});

	const elapsed = stats.endTime ? Math.round((stats.endTime - stats.startTime) / 1000) : 0;
	const minutes = Math.floor(elapsed / 60);
	const seconds = elapsed % 60;
	const accuracy =
		stats.totalCards > 0 ? Math.round((stats.correctFirstAttempt / stats.totalCards) * 100) : 0;

	return (
		<Box flexDirection="column" padding={1}>
			<Text bold underline>
				Session Complete
			</Text>
			<Text> </Text>
			<Text>Total cards: {stats.totalCards}</Text>
			<Text>
				Correct (first attempt): {stats.correctFirstAttempt}/{stats.totalCards} ({accuracy}%)
			</Text>
			<Text>Revision rounds: {stats.revisionRounds}</Text>
			<Text>
				Time: {minutes}m {seconds}s
			</Text>
			<Text> </Text>
			<Text dimColor>Press any key to exit</Text>
		</Box>
	);
}
