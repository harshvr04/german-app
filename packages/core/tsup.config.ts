import { defineConfig } from "tsup";

export default defineConfig({
	entry: [
		"src/schemas/index.ts",
		"src/types/german.ts",
		"src/engine/index.ts",
		"src/generators/index.ts",
		"src/session/index.ts",
		"src/data/loader.ts",
	],
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: true,
});
