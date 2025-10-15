"use client"

import { useIndexStore } from "@/stores"

export function Debug() {
	const config = useIndexStore((state) => state)

	if (!config.debug) return null

	return (
		<div className="bg-background absolute bottom-0 left-0 max-h-[50vh] overflow-y-auto border p-1">
			<pre>{JSON.stringify(config, null, 2)}</pre>
		</div>
	)
}
