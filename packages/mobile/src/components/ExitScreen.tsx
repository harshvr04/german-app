import { useEffect } from "react";
import { BackHandler, Image, Platform, StyleSheet, View } from "react-native";
import { colors } from "../theme";

export function ExitScreen() {
	useEffect(() => {
		const timer = setTimeout(() => {
			if (Platform.OS === "android") {
				BackHandler.exitApp();
			}
		}, 1500);
		return () => clearTimeout(timer);
	}, []);

	return (
		<View style={styles.container}>
			<Image
				source={require("../../assets/AppLogo.png")}
				style={styles.logo}
				resizeMode="contain"
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
		justifyContent: "center",
		alignItems: "center",
	},
	logo: {
		width: 200,
		height: 200,
		borderRadius: 24,
	},
});
