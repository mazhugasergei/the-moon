"use client"

import { StoreProvider } from "@/providers/store"
import { useIndexStore } from "@/stores"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger } from "./select"

export function Header() {
	return (
		<StoreProvider>
			<Component />
		</StoreProvider>
	)
}

export function Component() {
	const [mounted, setMounted] = useState(false)
	const [root, setRoot] = useState("/")

	const selected = useIndexStore((state) => state.selected)
	const setSelected = useIndexStore((state) => state.setSelected)

	useEffect(() => {
		setRoot(window.location.href.split("/").slice(0, 3).join("/"))
		setMounted(true)
	}, [])

	const handleChange = (value: string | number) => {
		setSelected(value as "earth" | "moon")
	}

	return (
		<header className="text-muted fixed top-0 left-0 z-50 flex w-full items-center justify-between gap-4 p-4">
			{mounted ? <a href={root}>home</a> : <span>home</span>}

			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">(moon)</div>

			<Select value={selected} onChange={handleChange}>
				<SelectTrigger>
					<span>{selected || "Select option"}</span>
				</SelectTrigger>

				<SelectContent alignX="right" alignY="bottom">
					<SelectItem value="moon">moon</SelectItem>
					<SelectItem value="earth">earth</SelectItem>
				</SelectContent>
			</Select>
		</header>
	)
}
