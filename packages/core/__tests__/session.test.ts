import { describe, expect, it } from "vitest";
import { type SessionState, createInitialState, sessionReducer } from "../src/session/index.js";
import type { Card, SessionConfig } from "../src/types/german.js";

// --- Test helpers ---

const config: SessionConfig = { level: "A1", category: "vocab", batchSize: 3 };

const cards: Card[] = [
	{ id: "c1", question: "Q1", answer: "A1" },
	{ id: "c2", question: "Q2", answer: "A2" },
	{ id: "c3", question: "Q3", answer: "A3" },
];

function startSession(c: Card[] = cards): SessionState {
	return sessionReducer(createInitialState(), { type: "START", cards: c, config });
}

// --- Tests ---

describe("createInitialState", () => {
	it("returns setup phase", () => {
		const state = createInitialState();
		expect(state.phase).toBe("setup");
	});
});

describe("sessionReducer — START", () => {
	it("transitions from setup to active", () => {
		const state = startSession();
		expect(state.phase).toBe("active");
	});

	it("sets cards and index to 0", () => {
		const state = startSession();
		if (state.phase !== "active") throw new Error("Expected active");
		expect(state.cards).toEqual(cards);
		expect(state.currentIndex).toBe(0);
	});

	it("initialises empty revision queue", () => {
		const state = startSession();
		if (state.phase !== "active") throw new Error("Expected active");
		expect(state.revisionQueue).toEqual([]);
	});

	it("sets stats with correct totalCards", () => {
		const state = startSession();
		if (state.phase !== "active") throw new Error("Expected active");
		expect(state.stats.totalCards).toBe(3);
		expect(state.stats.correctFirstAttempt).toBe(0);
		expect(state.stats.revisionRounds).toBe(0);
	});
});

describe("sessionReducer — ANSWER_RIGHT", () => {
	it("advances to next card", () => {
		const state = startSession();
		const next = sessionReducer(state, { type: "ANSWER_RIGHT" });
		if (next.phase !== "active") throw new Error("Expected active");
		expect(next.currentIndex).toBe(1);
	});

	it("increments correctFirstAttempt in active phase", () => {
		const state = startSession();
		const next = sessionReducer(state, { type: "ANSWER_RIGHT" });
		if (next.phase !== "active") throw new Error("Expected active");
		expect(next.stats.correctFirstAttempt).toBe(1);
	});

	it("does not add to revision queue", () => {
		const state = startSession();
		const next = sessionReducer(state, { type: "ANSWER_RIGHT" });
		if (next.phase !== "active") throw new Error("Expected active");
		expect(next.revisionQueue).toEqual([]);
	});
});

describe("sessionReducer — ANSWER_WRONG", () => {
	it("advances to next card", () => {
		const state = startSession();
		const next = sessionReducer(state, { type: "ANSWER_WRONG" });
		if (next.phase !== "active") throw new Error("Expected active");
		expect(next.currentIndex).toBe(1);
	});

	it("adds card ID to revision queue", () => {
		const state = startSession();
		const next = sessionReducer(state, { type: "ANSWER_WRONG" });
		if (next.phase !== "active") throw new Error("Expected active");
		expect(next.revisionQueue).toEqual(["c1"]);
	});

	it("does not increment correctFirstAttempt", () => {
		const state = startSession();
		const next = sessionReducer(state, { type: "ANSWER_WRONG" });
		if (next.phase !== "active") throw new Error("Expected active");
		expect(next.stats.correctFirstAttempt).toBe(0);
	});
});

describe("sessionReducer — completion (all correct)", () => {
	it("transitions to complete when all answered right", () => {
		let state = startSession();
		state = sessionReducer(state, { type: "ANSWER_RIGHT" });
		state = sessionReducer(state, { type: "ANSWER_RIGHT" });
		state = sessionReducer(state, { type: "ANSWER_RIGHT" });
		expect(state.phase).toBe("complete");
	});

	it("sets endTime on completion", () => {
		let state = startSession();
		state = sessionReducer(state, { type: "ANSWER_RIGHT" });
		state = sessionReducer(state, { type: "ANSWER_RIGHT" });
		state = sessionReducer(state, { type: "ANSWER_RIGHT" });
		if (state.phase !== "complete") throw new Error("Expected complete");
		expect(state.stats.endTime).toBeDefined();
	});

	it("records correct stats", () => {
		let state = startSession();
		state = sessionReducer(state, { type: "ANSWER_RIGHT" });
		state = sessionReducer(state, { type: "ANSWER_RIGHT" });
		state = sessionReducer(state, { type: "ANSWER_RIGHT" });
		if (state.phase !== "complete") throw new Error("Expected complete");
		expect(state.stats.correctFirstAttempt).toBe(3);
		expect(state.stats.revisionRounds).toBe(0);
	});
});

describe("sessionReducer — revision flow", () => {
	it("transitions to revision when some answers are wrong", () => {
		let state = startSession();
		state = sessionReducer(state, { type: "ANSWER_WRONG" }); // c1 wrong
		state = sessionReducer(state, { type: "ANSWER_RIGHT" }); // c2 right
		state = sessionReducer(state, { type: "ANSWER_RIGHT" }); // c3 right → triggers revision
		expect(state.phase).toBe("revision");
	});

	it("revision round has only failed cards", () => {
		let state = startSession();
		state = sessionReducer(state, { type: "ANSWER_WRONG" }); // c1 wrong
		state = sessionReducer(state, { type: "ANSWER_RIGHT" }); // c2 right
		state = sessionReducer(state, { type: "ANSWER_RIGHT" }); // c3 right
		if (state.phase !== "revision") throw new Error("Expected revision");
		expect(state.cards.length).toBe(1);
		expect(state.cards[0]!.id).toBe("c1");
		expect(state.round).toBe(1);
	});

	it("revision increments revisionRounds in stats", () => {
		let state = startSession();
		state = sessionReducer(state, { type: "ANSWER_WRONG" });
		state = sessionReducer(state, { type: "ANSWER_RIGHT" });
		state = sessionReducer(state, { type: "ANSWER_RIGHT" });
		if (state.phase !== "revision") throw new Error("Expected revision");
		expect(state.stats.revisionRounds).toBe(1);
	});

	it("completing revision round with all correct → complete", () => {
		let state = startSession();
		state = sessionReducer(state, { type: "ANSWER_WRONG" }); // c1 wrong
		state = sessionReducer(state, { type: "ANSWER_RIGHT" }); // c2 right
		state = sessionReducer(state, { type: "ANSWER_RIGHT" }); // c3 right → revision
		// Now in revision with only c1
		state = sessionReducer(state, { type: "ANSWER_RIGHT" }); // c1 right in revision → complete
		expect(state.phase).toBe("complete");
	});

	it("failing again in revision triggers another revision round", () => {
		let state = startSession();
		state = sessionReducer(state, { type: "ANSWER_WRONG" }); // c1 wrong
		state = sessionReducer(state, { type: "ANSWER_WRONG" }); // c2 wrong
		state = sessionReducer(state, { type: "ANSWER_RIGHT" }); // c3 right → revision with c1, c2
		if (state.phase !== "revision") throw new Error("Expected revision");
		expect(state.cards.length).toBe(2);
		expect(state.round).toBe(1);

		state = sessionReducer(state, { type: "ANSWER_RIGHT" }); // c1 right in rev
		state = sessionReducer(state, { type: "ANSWER_WRONG" }); // c2 wrong again → revision round 2
		if (state.phase !== "revision") throw new Error("Expected revision");
		expect(state.cards.length).toBe(1);
		expect(state.cards[0]!.id).toBe("c2");
		expect(state.round).toBe(2);
		expect(state.stats.revisionRounds).toBe(2);
	});

	it("does not increment correctFirstAttempt during revision", () => {
		let state = startSession();
		state = sessionReducer(state, { type: "ANSWER_WRONG" });
		state = sessionReducer(state, { type: "ANSWER_RIGHT" }); // +1 correct
		state = sessionReducer(state, { type: "ANSWER_RIGHT" }); // +1 correct → revision
		// correctFirstAttempt = 2

		state = sessionReducer(state, { type: "ANSWER_RIGHT" }); // revision right — should NOT increment
		if (state.phase !== "complete") throw new Error("Expected complete");
		expect(state.stats.correctFirstAttempt).toBe(2);
	});
});

describe("sessionReducer — no-op in wrong phase", () => {
	it("ANSWER_RIGHT in setup does nothing", () => {
		const state = createInitialState();
		const next = sessionReducer(state, { type: "ANSWER_RIGHT" });
		expect(next.phase).toBe("setup");
	});

	it("ANSWER_WRONG in complete does nothing", () => {
		let state = startSession([{ id: "c1", question: "Q", answer: "A" }]);
		state = sessionReducer(state, { type: "ANSWER_RIGHT" }); // → complete
		expect(state.phase).toBe("complete");
		const next = sessionReducer(state, { type: "ANSWER_WRONG" });
		expect(next.phase).toBe("complete");
	});
});
