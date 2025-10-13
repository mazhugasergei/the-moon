"use client"

import { useEffect, useState } from "react"

export function Header() {
	const [mounted, setMounted] = useState(false)
	const [root, setRoot] = useState("/")

	useEffect(() => {
		setRoot(window.location.href.split("/").slice(0, 3).join("/"))
		setMounted(true)
	}, [])

	return (
		<header className="text-white/50">
			{mounted ? (
				<a href={root} className="fixed top-0 left-0 z-50 p-4">
					Home
				</a>
			) : (
				<span className="fixed top-0 left-0 z-50 p-4">Home</span>
			)}

			<div className="fixed top-0 left-1/2 z-50 -translate-x-1/2 p-4">(Moon)</div>
		</header>
	)
}
