"use client"

import { EllipsisVerticalIcon } from "lucide-react"
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "./dropdown"

export function Footer() {
	return (
		<footer className="text-muted fixed right-0 bottom-0 left-0 flex items-center justify-end p-4">
			<Dropdown>
				<DropdownTrigger>
					<EllipsisVerticalIcon size={16} />
				</DropdownTrigger>
				<DropdownContent alignX="right" alignY="top">
					<DropdownItem>Option 1</DropdownItem>
					<DropdownItem>Option 2</DropdownItem>
				</DropdownContent>
			</Dropdown>
		</footer>
	)
}
