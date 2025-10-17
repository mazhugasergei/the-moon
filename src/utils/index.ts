import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export function deepMerge<T>(target: T, source: DeepPartial<T>): T {
	if (typeof target !== "object" || target === null) return source as T
	const output: any = Array.isArray(target) ? [...(target as any)] : { ...target }

	for (const key in source) {
		const val = source[key]
		if (val && typeof val === "object" && !Array.isArray(val)) {
			output[key] = deepMerge((target as any)[key], val)
		} else if (val !== undefined) {
			output[key] = val
		}
	}

	return output
}
