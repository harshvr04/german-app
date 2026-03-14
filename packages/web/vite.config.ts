import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			react: resolve(__dirname, "node_modules/react"),
			"react-dom": resolve(__dirname, "node_modules/react-dom"),
		},
	},
	server: {
		fs: {
			// Allow serving files from the monorepo root (assets/data, packages/core)
			allow: [resolve(__dirname, "../..")],
		},
	},
});
