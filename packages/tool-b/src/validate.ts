import type { z } from "zod";

export interface ValidationResult<T> {
	valid: T[];
	errors: Array<{ index: number; raw: unknown; issues: z.ZodIssue[] }>;
}

export function validateBatchResults<T>(
	rawJsonStrings: string[],
	schema: z.ZodType<T>,
): ValidationResult<T> {
	const valid: T[] = [];
	const errors: ValidationResult<T>["errors"] = [];

	for (const raw of rawJsonStrings) {
		let parsed: unknown;
		try {
			const cleaned = raw
				.replace(/^```json?\n?/, "")
				.replace(/\n?```$/, "")
				.trim();
			parsed = JSON.parse(cleaned);
		} catch {
			errors.push({
				index: errors.length,
				raw,
				issues: [
					{
						code: "custom",
						path: [],
						message: `Failed to parse JSON: ${raw.slice(0, 100)}...`,
					},
				],
			});
			continue;
		}

		const arr = Array.isArray(parsed) ? parsed : [parsed];

		for (let i = 0; i < arr.length; i++) {
			const result = schema.safeParse(arr[i]);
			if (result.success) {
				valid.push(result.data);
			} else {
				errors.push({ index: i, raw: arr[i], issues: result.error.issues });
			}
		}
	}

	return { valid, errors };
}

export function mergeWithExisting<T extends { [key: string]: unknown }>(
	existing: T[],
	incoming: T[],
	keyField: keyof T,
): T[] {
	const map = new Map<unknown, T>();

	for (const item of existing) {
		map.set(item[keyField], item);
	}

	for (const item of incoming) {
		const existingItem = map.get(item[keyField]);
		if (existingItem && (existingItem as Record<string, unknown>).manual === true) {
			continue;
		}
		map.set(item[keyField], item);
	}

	return Array.from(map.values());
}
