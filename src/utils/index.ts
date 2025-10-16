import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function deepMerge<T>(target: T, source: Partial<T>): T {
	if (typeof target !== "object" || target === null) return source as T
	const output = { ...target }
	for (const key in source) {
		const val = source[key]
		if (val && typeof val === "object" && !Array.isArray(val)) {
			output[key] = deepMerge((target as any)[key], val)
		} else if (val !== undefined) {
			output[key] = val as any
		}
	}
	return output
}
