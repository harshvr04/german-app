import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { type Colors, type Theme, darkColors, lightColors } from "./index";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (t: Theme) => void;
	colors: Colors;
}

const ThemeContext = createContext<ThemeContextValue>({
	theme: "dark",
	setTheme: () => {},
	colors: darkColors,
});

const THEME_KEY = "@german-practice/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>("dark");

	useEffect(() => {
		AsyncStorage.getItem(THEME_KEY).then((v) => {
			if (v === "light" || v === "dark") setThemeState(v);
		});
	}, []);

	const setTheme = (t: Theme) => {
		setThemeState(t);
		AsyncStorage.setItem(THEME_KEY, t);
	};

	const colors = theme === "dark" ? darkColors : lightColors;

	return (
		<ThemeContext.Provider value={{ theme, setTheme, colors }}>{children}</ThemeContext.Provider>
	);
}

export function useTheme() {
	return useContext(ThemeContext);
}
