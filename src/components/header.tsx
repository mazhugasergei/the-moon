import Link from "next/link"

export function Header() {
	return (
		<header className="text-white/50">
			<Link href="/" className="fixed top-0 left-0 z-50 p-4">
				Back
			</Link>

			<div className="fixed top-0 left-1/2 z-50 -translate-x-1/2 p-4">(Moon)</div>
		</header>
	)
}
