import type { SessionStats } from "@german/core/types";

interface Props {
	stats: SessionStats;
	onNewSession: () => void;
}

export function CompleteScreen({ stats, onNewSession }: Props) {
	const elapsed = stats.endTime ? Math.round((stats.endTime - stats.startTime) / 1000) : 0;
	const minutes = Math.floor(elapsed / 60);
	const seconds = elapsed % 60;
	const accuracy =
		stats.totalCards > 0 ? Math.round((stats.correctFirstAttempt / stats.totalCards) * 100) : 0;

	return (
		<div className="screen">
			<div className="complete-content">
				<div className="complete-title">Session Complete</div>

				<div className="stats-card">
					<div className="stat-row">
						<span className="stat-label">Total cards</span>
						<span className="stat-value">{stats.totalCards}</span>
					</div>
					<div className="stat-row">
						<span className="stat-label">Correct (first attempt)</span>
						<span className="stat-value">
							{stats.correctFirstAttempt}/{stats.totalCards} ({accuracy}%)
						</span>
					</div>
					<div className="stat-row">
						<span className="stat-label">Revision rounds</span>
						<span className="stat-value">{stats.revisionRounds}</span>
					</div>
					<div className="stat-row">
						<span className="stat-label">Time</span>
						<span className="stat-value">
							{minutes}m {seconds}s
						</span>
					</div>
				</div>

				<button className="btn-accent" type="button" onClick={onNewSession}>
					New Session
				</button>
			</div>
		</div>
	);
}
