"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Header() {
	const pathname = usePathname()

	// remove everything after the first "/" in the path
	const rootPath = pathname.split("/")[1] ? "/" : "/"

	return (
		<header className="text-white/50">
			<Link href={rootPath} className="fixed top-0 left-0 z-50 p-4">
				Home
			</Link>

			<div className="fixed top-0 left-1/2 z-50 -translate-x-1/2 p-4">(Moon)</div>
		</header>
	)
}
