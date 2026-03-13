import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { Platform } from "react-native";
import { REPORT_WEBHOOK_URL } from "../config";

const ANON_ID_KEY = "@german-app/anon-id";

function generateId(): string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	let id = "";
	for (let i = 0; i < 16; i++) {
		id += chars[Math.floor(Math.random() * chars.length)];
	}
	return id;
}

async function getOrCreateAnonId(): Promise<string> {
	const existing = await AsyncStorage.getItem(ANON_ID_KEY);
	if (existing) return existing;
	const id = generateId();
	await AsyncStorage.setItem(ANON_ID_KEY, id);
	return id;
}

/** Sends a single "app_open" ping on mount. The webhook upserts a row per anonId. */
export function useAnalytics() {
	useEffect(() => {
		if (REPORT_WEBHOOK_URL.length === 0) return;

		getOrCreateAnonId().then((id) => {
			fetch(REPORT_WEBHOOK_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: "analytics",
					anonId: id,
					os: Platform.OS,
					osVersion: String(Platform.Version),
				}),
			}).catch(() => {});
		});
	}, []);
}
