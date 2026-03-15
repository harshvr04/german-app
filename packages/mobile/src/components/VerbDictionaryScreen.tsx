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
import { useMemo, useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { REPORT_WEBHOOK_URL } from "../config";
import { hasDataForLevel, loadVerbs } from "../data/loader";
import { scale, spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";
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
	{
		key: "plusquamperfekt",
		label: "Plusquamperfekt",
		conjugate: conjugatePlusquamperfekt,
	},
	{ key: "konjunktiv2", label: "Konjunktiv II", conjugate: conjugateKonjunktivII },
	{ key: "konjunktiv1", label: "Konjunktiv I", conjugate: conjugateKonjunktivI },
];

function tensesForLevel(level: Level): Tense[] {
	const idx = LEVELS.indexOf(level);
	// A1: Präsens, Perfekt
	if (idx <= 0) return ALL_TENSES.slice(0, 2);
	// A2: + Futur I, Präteritum
	if (idx === 1) return ALL_TENSES.slice(0, 4);
	// B1: + Plusquamperfekt, Konjunktiv II
	if (idx === 2) return ALL_TENSES.slice(0, 6);
	// B2+: all 7
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
	const { colors } = useTheme();
	const [screen, setScreen] = useState<Screen>("list");
	const [query, setQuery] = useState("");
	const [selectedVerb, setSelectedVerb] = useState<Verb | null>(null);
	const [selectedTense, setSelectedTense] = useState<Tense | null>(null);
	const [reportVisible, setReportVisible] = useState(false);
	const listRef = useRef<FlatList>(null);

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

	const themed = useMemo(
		() =>
			StyleSheet.create({
				container: { flex: 1, backgroundColor: colors.background },
				appTitle: { ...typography.title, color: colors.text, flex: 1 },
				backButtonText: { ...typography.body, color: colors.textSecondary },
				count: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
				searchInput: {
					backgroundColor: colors.surface,
					borderRadius: scale(12),
					paddingVertical: spacing.sm,
					paddingHorizontal: spacing.md,
					...typography.body,
					color: colors.text,
					borderWidth: 1,
					borderColor: colors.border,
				},
				entry: {
					backgroundColor: colors.surface,
					borderRadius: scale(12),
					padding: spacing.md,
					marginBottom: spacing.sm,
				},
				levelBadge: { fontSize: scale(10), color: colors.accent, fontWeight: "700" },
				word: { ...typography.question, color: colors.text },
				meaning: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
				sectionTitle: {
					...typography.body,
					color: colors.textSecondary,
					paddingHorizontal: spacing.lg,
					marginBottom: spacing.md,
				},
				tenseOption: {
					backgroundColor: colors.surface,
					borderRadius: scale(12),
					paddingVertical: spacing.md,
					paddingHorizontal: spacing.lg,
					marginBottom: spacing.sm,
				},
				tenseText: { ...typography.body, color: colors.text },
				verbMeaning: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
				verbExample: {
					...typography.caption,
					color: colors.textSecondary,
					fontStyle: "italic",
					marginTop: spacing.xs,
				},
				conjugationRow: {
					backgroundColor: colors.surface,
					borderRadius: scale(12),
					padding: spacing.md,
					marginBottom: spacing.sm,
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
				},
				personText: { ...typography.body, color: colors.textSecondary, width: scale(90) },
				conjugatedText: { ...typography.body, color: colors.text, flex: 1, textAlign: "right" },
				verbInfoSection: {
					marginTop: spacing.lg,
					backgroundColor: colors.surface,
					borderRadius: scale(12),
					padding: spacing.md,
				},
				infoLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
				infoValue: { ...typography.body, color: colors.text },
				reportButton: {
					marginTop: spacing.lg,
					alignSelf: "center",
					paddingVertical: spacing.sm,
					paddingHorizontal: spacing.lg,
					borderRadius: scale(8),
					borderWidth: 1,
					borderColor: colors.border,
				},
				reportText: { ...typography.caption, color: colors.textSecondary },
			}),
		[colors],
	);

	const handleSelectVerb = (verb: Verb) => {
		setSelectedVerb(verb);
		setScreen("tenses");
	};

	const handleSelectTense = (tense: Tense) => {
		setSelectedTense(tense);
		setScreen("conjugation");
	};

	const handleBackFromTenses = () => {
		setSelectedVerb(null);
		setScreen("list");
	};

	const handleBackFromConjugation = () => {
		setSelectedTense(null);
		setScreen("tenses");
	};

	const title = level ? `Verb Dictionary — ${level}` : "Verb Dictionary — All Levels";

	// --- Verb List Screen ---
	if (screen === "list") {
		return (
			<SafeAreaView style={themed.container}>
				<View style={styles.header}>
					<View style={styles.headerRow}>
						<Text style={themed.appTitle}>{title}</Text>
						<Pressable style={styles.backButton} onPress={onBack}>
							<Text style={themed.backButtonText}>←</Text>
						</Pressable>
					</View>
					<Text style={themed.count}>
						{filtered.length} {filtered.length === 1 ? "verb" : "verbs"}
					</Text>
				</View>

				<View style={styles.searchContainer}>
					<TextInput
						style={themed.searchInput}
						placeholder="Search verbs..."
						placeholderTextColor={colors.textDisabled}
						value={query}
						onChangeText={setQuery}
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</View>

				<FlatList
					ref={listRef}
					data={filtered}
					keyExtractor={(item) => item.infinitiv}
					style={styles.list}
					contentContainerStyle={styles.listContent}
					maxToRenderPerBatch={20}
					windowSize={5}
					removeClippedSubviews
					renderItem={({ item }) => (
						<Pressable style={themed.entry} onPress={() => handleSelectVerb(item)}>
							<View style={styles.wordRow}>
								{!level && <Text style={themed.levelBadge}>{item.level}</Text>}
								<Text style={themed.word}>{formatSeparableVerb(item)}</Text>
							</View>
							<Text style={themed.meaning}>{item.meaning}</Text>
						</Pressable>
					)}
				/>
			</SafeAreaView>
		);
	}

	// --- Tense Selection Screen ---
	if (screen === "tenses" && selectedVerb) {
		return (
			<SafeAreaView style={themed.container}>
				<View style={styles.header}>
					<View style={styles.headerRow}>
						<Text style={themed.appTitle}>{formatSeparableVerb(selectedVerb)}</Text>
						<Pressable style={styles.backButton} onPress={handleBackFromTenses}>
							<Text style={themed.backButtonText}>←</Text>
						</Pressable>
					</View>
					<Text style={themed.verbMeaning}>{selectedVerb.meaning}</Text>
					{selectedVerb.example !== "" && (
						<Text style={themed.verbExample}>{selectedVerb.example}</Text>
					)}
				</View>

				<Text style={themed.sectionTitle}>Select Tense</Text>

				<ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
					{availableTenses.map((tense) => (
						<Pressable
							key={tense.key}
							style={themed.tenseOption}
							onPress={() => handleSelectTense(tense)}
						>
							<Text style={themed.tenseText}>{tense.label}</Text>
						</Pressable>
					))}
				</ScrollView>
			</SafeAreaView>
		);
	}

	// --- Conjugation Screen ---
	if (screen === "conjugation" && selectedVerb && selectedTense) {
		return (
			<SafeAreaView style={themed.container}>
				<View style={styles.header}>
					<View style={styles.headerRow}>
						<Text style={themed.appTitle}>
							{formatSeparableVerb(selectedVerb)} — {selectedTense.label}
						</Text>
						<Pressable style={styles.backButton} onPress={handleBackFromConjugation}>
							<Text style={themed.backButtonText}>←</Text>
						</Pressable>
					</View>
					<Text style={themed.verbMeaning}>{selectedVerb.meaning}</Text>
				</View>

				<ScrollView style={styles.list} contentContainerStyle={styles.conjugationContent}>
					{PERSONS.map((person) => (
						<View key={person} style={themed.conjugationRow}>
							<Text style={themed.personText}>{person}</Text>
							<Text style={themed.conjugatedText}>
								{formatConjugatedForm(selectedVerb, selectedTense.conjugate(selectedVerb, person))}
							</Text>
						</View>
					))}

					<View style={themed.verbInfoSection}>
						<Text style={themed.infoLabel}>Type</Text>
						<Text style={themed.infoValue}>{selectedVerb.type}</Text>
						<Text style={themed.infoLabel}>Auxiliary</Text>
						<Text style={themed.infoValue}>{selectedVerb.auxiliary}</Text>
						<Text style={themed.infoLabel}>Partizip II</Text>
						<Text style={themed.infoValue}>{selectedVerb.partizip_ii}</Text>
						{selectedVerb.prepositions.length > 0 && (
							<>
								<Text style={themed.infoLabel}>Prepositions</Text>
								<Text style={themed.infoValue}>
									{selectedVerb.prepositions.map((p) => `${p.preposition} + ${p.case}`).join(", ")}
								</Text>
							</>
						)}
					</View>

					{REPORT_WEBHOOK_URL.length > 0 && (
						<Pressable style={themed.reportButton} onPress={() => setReportVisible(true)}>
							<Text style={themed.reportText}>Report Issue</Text>
						</Pressable>
					)}
				</ScrollView>
				<ReportModal
					visible={reportVisible}
					onClose={() => setReportVisible(false)}
					word={`${selectedVerb.infinitiv} — ${selectedTense.label}`}
					level={selectedVerb.level}
					category="verb-dictionary"
				/>
			</SafeAreaView>
		);
	}

	return null;
}

const styles = StyleSheet.create({
	header: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.xl,
		paddingBottom: spacing.sm,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	backButton: {
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.xs,
	},
	searchContainer: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.md,
	},
	list: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.xl,
	},
	wordRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
	},
	conjugationContent: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.xl,
	},
});
