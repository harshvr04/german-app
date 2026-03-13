import { useEventListener } from "expo";
import { VideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

interface Props {
	onFinish: () => void;
}

export function SplashVideo({ onFinish }: Props) {
	const finishedRef = useRef(false);

	const handleFinish = useCallback(() => {
		if (finishedRef.current) return;
		finishedRef.current = true;
		onFinish();
	}, [onFinish]);

	const player = useVideoPlayer(require("../../assets/AppStartScreenAnimation.mp4"), (p) => {
		p.loop = false;
		p.play();
	});

	useEventListener(player, "playToEnd", handleFinish);

	useEffect(() => {
		// Fallback timeout in case playToEnd doesn't fire
		const timeout = setTimeout(handleFinish, 10000);
		return () => clearTimeout(timeout);
	}, [handleFinish]);

	return (
		<View style={styles.container}>
			<VideoView player={player} style={styles.video} nativeControls={false} contentFit="contain" />
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
	video: {
		...StyleSheet.absoluteFillObject,
		margin: 16,
	},
});
