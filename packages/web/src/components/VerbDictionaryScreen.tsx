import {
	conjugateFuturI,
	conjugateKonjunktivI,
	conjugateKonjunktivII,
	conjugatePerfekt,
	conjugatePlusquamperfekt,
	conjugatePraeteritum,
	conjugatePresent,
	formatConjugatedForm,
	formatSeparableVerb,
} from "@german/core/engine";
import type { Verb } from "@german/core/schemas";
import type { Level, Person } from "@german/core/types";
import { LEVELS } from "@german/core/types";
import { useMemo, useState } from "react";
import { REPORT_WEBHOOK_URL } from "../config";
import { hasDataForLevel, loadVerbs } from "../data/loader";
import { ReportModal } from "./ReportModal";

interface Props {
	level: Level | null;
	onBack: () => void;
}

type Tense = {
	key: string;
	label: string;
	conjugate: (verb: Verb, person: Person) => string;
};

const ALL_TENSES: Tense[] = [
	{ key: "present", label: "Präsens", conjugate: conjugatePresent },
	{ key: "perfekt", label: "Perfekt", conjugate: conjugatePerfekt },
	{ key: "futur1", label: "Futur I", conjugate: conjugateFuturI },
	{ key: "praeteritum", label: "Präteritum", conjugate: conjugatePraeteritum },
	{ key: "plusquamperfekt", label: "Plusquamperfekt", conjugate: conjugatePlusquamperfekt },
	{ key: "konjunktiv2", label: "Konjunktiv II", conjugate: conjugateKonjunktivII },
	{ key: "konjunktiv1", label: "Konjunktiv I", conjugate: conjugateKonjunktivI },
];

function tensesForLevel(level: Level): Tense[] {
	const idx = LEVELS.indexOf(level);
	if (idx <= 0) return ALL_TENSES.slice(0, 2);
	if (idx === 1) return ALL_TENSES.slice(0, 4);
	if (idx === 2) return ALL_TENSES.slice(0, 6);
	return ALL_TENSES;
}

const PERSONS: Person[] = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];

// Module-level cache
const verbCache = new Map<string, Verb[]>();

function loadVerbsForDict(level: Level | null): Verb[] {
	const key = level ?? "all";
	const cached = verbCache.get(key);
	if (cached) return cached;

	let verbs: Verb[];
	if (level) {
		verbs = loadVerbs(level);
	} else {
		const all: Verb[] = [];
		const seen = new Set<string>();
		for (const l of LEVELS) {
			if (!hasDataForLevel(l)) continue;
			for (const v of loadVerbs(l)) {
				if (!seen.has(v.infinitiv)) {
					seen.add(v.infinitiv);
					all.push(v);
				}
			}
		}
		all.sort((a, b) => a.infinitiv.localeCompare(b.infinitiv, "de"));
		verbs = all;
	}
	verbCache.set(key, verbs);
	return verbs;
}

type Screen = "list" | "tenses" | "conjugation";

export function VerbDictionaryScreen({ level, onBack }: Props) {
	const [screen, setScreen] = useState<Screen>("list");
	const [query, setQuery] = useState("");
	const [selectedVerb, setSelectedVerb] = useState<Verb | null>(null);
	const [selectedTense, setSelectedTense] = useState<Tense | null>(null);
	const [reportVisible, setReportVisible] = useState(false);

	const verbs = useMemo(() => loadVerbsForDict(level), [level]);

	const filtered = useMemo(() => {
		if (!query) return verbs;
		const q = query.toLowerCase();
		return verbs.filter(
			(v) => v.infinitiv.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q),
		);
	}, [verbs, query]);

	const availableTenses = useMemo(
		() => (selectedVerb ? (level ? tensesForLevel(level) : ALL_TENSES) : []),
		[selectedVerb, level],
	);

	const title = level ? `Verb Dictionary — ${level}` : "Verb Dictionary — All Levels";

	// --- Verb List Screen ---
	if (screen === "list") {
		return (
			<div className="screen">
				<div className="header">
					<div className="header-row">
						<div className="app-title">{title}</div>
						<button className="back-btn" type="button" onClick={onBack}>
							←
						</button>
					</div>
					<div className="count-text">
						{filtered.length} {filtered.length === 1 ? "verb" : "verbs"}
					</div>
				</div>

				<div className="search-container">
					<input
						className="search-input"
						placeholder="Search verbs..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						autoCapitalize="none"
						autoCorrect="off"
					/>
				</div>

				<div className="scroll-list">
					{filtered.map((item) => (
						<div
							key={item.infinitiv}
							className="entry entry-clickable"
							onClick={() => {
								setSelectedVerb(item);
								setScreen("tenses");
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									setSelectedVerb(item);
									setScreen("tenses");
								}
							}}
						>
							<div className="word-row">
								{!level && <span className="level-badge-small">{item.level}</span>}
								<span className="word-text">{formatSeparableVerb(item)}</span>
							</div>
							<div className="meaning-text">{item.meaning}</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	// --- Tense Selection Screen ---
	if (screen === "tenses" && selectedVerb) {
		return (
			<div className="screen">
				<div className="header">
					<div className="header-row">
						<div className="app-title">{formatSeparableVerb(selectedVerb)}</div>
						<button
							className="back-btn"
							type="button"
							onClick={() => {
								setSelectedVerb(null);
								setScreen("list");
							}}
						>
							←
						</button>
					</div>
					<div className="verb-meaning">{selectedVerb.meaning}</div>
					{selectedVerb.example !== "" && (
						<div className="verb-example">{selectedVerb.example}</div>
					)}
				</div>

				<div className="section-title">Select Tense</div>

				<div className="scroll-list">
					{availableTenses.map((tense) => (
						<button
							key={tense.key}
							className="tense-option"
							type="button"
							onClick={() => {
								setSelectedTense(tense);
								setScreen("conjugation");
							}}
						>
							{tense.label}
						</button>
					))}
				</div>
			</div>
		);
	}

	// --- Conjugation Screen ---
	if (screen === "conjugation" && selectedVerb && selectedTense) {
		return (
			<div className="screen">
				<div className="header">
					<div className="header-row">
						<div className="app-title">
							{formatSeparableVerb(selectedVerb)} — {selectedTense.label}
						</div>
						<button
							className="back-btn"
							type="button"
							onClick={() => {
								setSelectedTense(null);
								setScreen("tenses");
							}}
						>
							←
						</button>
					</div>
					<div className="verb-meaning">{selectedVerb.meaning}</div>
				</div>

				<div className="scroll-list">
					{PERSONS.map((person) => (
						<div key={person} className="conjugation-row">
							<span className="person-text">{person}</span>
							<span className="conjugated-text">
								{formatConjugatedForm(selectedVerb, selectedTense.conjugate(selectedVerb, person))}
							</span>
						</div>
					))}

					<div className="verb-info-section">
						<div className="info-label">Type</div>
						<div className="info-value">{selectedVerb.type}</div>
						<div className="info-label">Auxiliary</div>
						<div className="info-value">{selectedVerb.auxiliary}</div>
						<div className="info-label">Partizip II</div>
						<div className="info-value">{selectedVerb.partizip_ii}</div>
						{selectedVerb.prepositions.length > 0 && (
							<>
								<div className="info-label">Prepositions</div>
								<div className="info-value">
									{selectedVerb.prepositions.map((p) => `${p.preposition} + ${p.case}`).join(", ")}
								</div>
							</>
						)}
					</div>

					{REPORT_WEBHOOK_URL.length > 0 && (
						<button
							className="report-btn"
							type="button"
							style={{ marginTop: 24 }}
							onClick={() => setReportVisible(true)}
						>
							Report Issue
						</button>
					)}
				</div>

				<ReportModal
					visible={reportVisible}
					onClose={() => setReportVisible(false)}
					word={`${selectedVerb.infinitiv} — ${selectedTense.label}`}
					level={selectedVerb.level}
					category="verb-dictionary"
				/>
			</div>
		);
	}

	return null;
}
