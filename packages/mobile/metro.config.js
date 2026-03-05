const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so Metro picks up changes in @german/core
config.watchFolders = [monorepoRoot];

// Resolve node_modules from both the project and the monorepo root (pnpm hoisting)
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(monorepoRoot, "node_modules"),
];

// Custom resolver for @german/core subpath exports and .js extension stripping
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
	// Map @german/core/* subpath imports to core source files
	if (moduleName.startsWith("@german/core/")) {
		const subpath = moduleName.replace("@german/core/", "");
		const mapping = {
			schemas: "../core/src/schemas/index.ts",
			types: "../core/src/types/german.ts",
			engine: "../core/src/engine/index.ts",
			generators: "../core/src/generators/index.ts",
			session: "../core/src/session/index.ts",
		};
		if (mapping[subpath]) {
			return {
				filePath: path.resolve(projectRoot, mapping[subpath]),
				type: "sourceFile",
			};
		}
	}

	// Strip .js extensions from core package internal imports (NodeNext → Metro compat)
	let resolved = moduleName;
	if (context.originModulePath?.includes("packages/core/src") && resolved.endsWith(".js")) {
		resolved = resolved.replace(/\.js$/, "");
	}

	// Fall back to default resolution
	if (originalResolveRequest) {
		return originalResolveRequest(context, resolved, platform);
	}
	return context.resolveRequest(context, resolved, platform);
};

module.exports = config;
