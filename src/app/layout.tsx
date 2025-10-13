import "@/assets/styles/globals.css"
import { Header } from "@/components/header"
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "(moon)",
}

export default function RootLayout(props: LayoutProps<"/">) {
	return (
		<html lang="en">
			<body>
				<Header />
				{props.children}
			</body>
		</html>
	)
}
