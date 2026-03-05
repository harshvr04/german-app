import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadAdjectives, loadNouns, loadOthers, loadVerbs } from "../src/data/loader.js";

const dataDir = resolve(fileURLToPath(import.meta.url), "../../../..", "assets/data");

describe("loadNouns", () => {
	it("loads all A1 nouns from seed data", () => {
		const nouns = loadNouns(dataDir, "A1");
		expect(nouns.length).toBeGreaterThan(0);
		for (const noun of nouns) {
			expect(noun.level).toBe("A1");
		}
	});

	it("returns empty for a level with no data", () => {
		const nouns = loadNouns(dataDir, "C2");
		expect(nouns).toEqual([]);
	});

	it("each noun has required fields", () => {
		const nouns = loadNouns(dataDir, "A1");
		for (const noun of nouns) {
			expect(noun.word).toBeDefined();
			expect(["m", "f", "n"]).toContain(noun.gender);
			expect(typeof noun.is_n_dekl).toBe("boolean");
			expect(noun.meaning).toBeDefined();
		}
	});
});

describe("loadVerbs", () => {
	it("loads all A1 verbs from seed data", () => {
		const verbs = loadVerbs(dataDir, "A1");
		expect(verbs.length).toBeGreaterThan(0);
		for (const verb of verbs) {
			expect(verb.level).toBe("A1");
		}
	});

	it("each verb has required fields", () => {
		const verbs = loadVerbs(dataDir, "A1");
		for (const verb of verbs) {
			expect(verb.infinitiv).toBeDefined();
			expect(["regular", "irregular", "mixed"]).toContain(verb.type);
			expect(["haben", "sein"]).toContain(verb.auxiliary);
			expect(verb.partizip_ii).toBeDefined();
		}
	});
});

describe("loadAdjectives", () => {
	it("loads all A1 adjectives from seed data", () => {
		const adjectives = loadAdjectives(dataDir, "A1");
		expect(adjectives.length).toBeGreaterThan(0);
		for (const adj of adjectives) {
			expect(adj.level).toBe("A1");
		}
	});

	it("each adjective has required fields", () => {
		const adjectives = loadAdjectives(dataDir, "A1");
		for (const adj of adjectives) {
			expect(adj.word).toBeDefined();
			expect(typeof adj.is_declinable).toBe("boolean");
			expect(adj.meaning).toBeDefined();
		}
	});
});

describe("loadOthers", () => {
	it("loads all A1 others from seed data", () => {
		const others = loadOthers(dataDir, "A1");
		expect(others.length).toBeGreaterThan(0);
		for (const other of others) {
			expect(other.level).toBe("A1");
		}
	});

	it("each other entry has required fields", () => {
		const others = loadOthers(dataDir, "A1");
		for (const other of others) {
			expect(other.word).toBeDefined();
			expect(other.meaning).toBeDefined();
			expect(other.example).toBeDefined();
		}
	});
});
