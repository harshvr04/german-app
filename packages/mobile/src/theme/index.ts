import { Dimensions } from "react-native";

const BASE_WIDTH = 375;
const screenWidth = Dimensions.get("window").width;
export const scale = (size: number) => Math.round(Math.min(screenWidth / BASE_WIDTH, 1.5) * size);

export type Theme = "dark" | "light";

export const darkColors = {
	background: "#1a1a2e",
	surface: "#16213e",
	primary: "#0f3460",
	accent: "#e94560",
	correct: "#4ecca3",
	wrong: "#e94560",
	answerText: "#4ecca3",
	text: "#eeeee4",
	textSecondary: "#a0a0b0",
	textDisabled: "#555566",
	warning: "#f0a500",
	border: "#2a2a4e",
};

export const lightColors = {
	background: "#FFFFFF",
	surface: "#F5F0E0",
	primary: "#CC338B",
	accent: "#CC338B",
	correct: "#4ecca3",
	wrong: "#e94560",
	answerText: "#CC338B",
	text: "#000000",
	textSecondary: "#444444",
	textDisabled: "#999999",
	warning: "#FFCC00",
	border: "#E0D8C0",
};

export type Colors = typeof darkColors;

export const themeColors: Record<Theme, Colors> = {
	dark: darkColors,
	light: lightColors,
};

// Default export for backwards compat (used by components that haven't switched yet)
export const colors = darkColors;

export const spacing = {
	xs: scale(4),
	sm: scale(8),
	md: scale(16),
	lg: scale(24),
	xl: scale(32),
};

export const typography = {
	title: { fontSize: scale(24), fontWeight: "700" as const, fontFamily: "Georgia" },
	body: { fontSize: scale(18), fontFamily: "Georgia" },
	caption: { fontSize: scale(14), fontFamily: "Georgia" },
	question: { fontSize: scale(22), fontWeight: "600" as const, fontFamily: "Georgia" },
	answer: { fontSize: scale(20), fontFamily: "Georgia" },
};
