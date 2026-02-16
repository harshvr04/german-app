import type { Card, SessionConfig, SessionStats } from "../types/german.js";

// --- State ---

interface SetupState {
	phase: "setup";
}

interface ActiveState {
	phase: "active";
	config: SessionConfig;
	cards: Card[];
	currentIndex: number;
	revisionQueue: string[];
	stats: SessionStats;
}

interface RevisionState {
	phase: "revision";
	config: SessionConfig;
	cards: Card[];
	currentIndex: number;
	revisionQueue: string[];
	round: number;
	stats: SessionStats;
}

interface CompleteState {
	phase: "complete";
	stats: SessionStats;
}

export type SessionState = SetupState | ActiveState | RevisionState | CompleteState;

// --- Actions ---

export type SessionAction =
	| { type: "START"; cards: Card[]; config: SessionConfig }
	| { type: "ANSWER_RIGHT" }
	| { type: "ANSWER_WRONG" };

// --- Reducer ---

function initStats(totalCards: number): SessionStats {
	return {
		totalCards,
		correctFirstAttempt: 0,
		revisionRounds: 0,
		startTime: Date.now(),
	};
}

function advanceOrTransition(
	state: ActiveState | RevisionState,
	addToRevision: boolean,
): SessionState {
	const currentCard = state.cards[state.currentIndex];
	const revisionQueue =
		addToRevision && currentCard ? [...state.revisionQueue, currentCard.id] : state.revisionQueue;

	const stats: SessionStats = {
		...state.stats,
		correctFirstAttempt:
			!addToRevision && state.phase === "active"
				? state.stats.correctFirstAttempt + 1
				: state.stats.correctFirstAttempt,
	};

	const nextIndex = state.currentIndex + 1;

	if (nextIndex < state.cards.length) {
		return { ...state, currentIndex: nextIndex, revisionQueue, stats };
	}

	if (revisionQueue.length > 0) {
		const revisionCards = state.cards.filter((c) => revisionQueue.includes(c.id));
		const round = state.phase === "revision" ? state.round + 1 : 1;
		return {
			phase: "revision",
			config: state.config,
			cards: revisionCards,
			currentIndex: 0,
			revisionQueue: [],
			round,
			stats: { ...stats, revisionRounds: stats.revisionRounds + 1 },
		};
	}

	return {
		phase: "complete",
		stats: { ...stats, endTime: Date.now() },
	};
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
	switch (action.type) {
		case "START": {
			return {
				phase: "active",
				config: action.config,
				cards: action.cards,
				currentIndex: 0,
				revisionQueue: [],
				stats: initStats(action.cards.length),
			};
		}
		case "ANSWER_RIGHT": {
			if (state.phase !== "active" && state.phase !== "revision") return state;
			return advanceOrTransition(state, false);
		}
		case "ANSWER_WRONG": {
			if (state.phase !== "active" && state.phase !== "revision") return state;
			return advanceOrTransition(state, true);
		}
	}
}

export function createInitialState(): SessionState {
	return { phase: "setup" };
}
