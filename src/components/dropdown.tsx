"use client"

import { cn } from "@/utils"
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react"

interface DropdownContextValue {
	open: boolean
	setOpen: (v: boolean) => void
}

const DropdownContext = createContext<DropdownContextValue | null>(null)

function useDropdown() {
	const ctx = useContext(DropdownContext)
	if (!ctx) throw new Error("Dropdown components must be used within <Dropdown>")
	return ctx
}

export function Dropdown({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [])

	return (
		<DropdownContext.Provider value={{ open, setOpen }}>
			<div ref={ref} className="relative">
				{children}
			</div>
		</DropdownContext.Provider>
	)
}

export function DropdownTrigger({ children, className }: { children: ReactNode; className?: string }) {
	const { setOpen, open } = useDropdown()
	return (
		<button
			type="button"
			className={cn("flex w-full cursor-pointer items-center justify-between text-left", className)}
			onClick={() => setOpen(!open)}
		>
			{children}
		</button>
	)
}

interface DropdownContentProps {
	children: ReactNode
	alignX?: "left" | "right"
	alignY?: "top" | "bottom"
}

export function DropdownContent({ children, alignX = "right", alignY = "bottom" }: DropdownContentProps) {
	const { open } = useDropdown()
	if (!open) return null

	return (
		<ul
			onClick={(e) => e.stopPropagation()}
			className={cn(
				"bg-background absolute z-10 max-h-60 overflow-y-auto border",
				alignX === "left" ? "left-0" : "right-0",
				alignY === "top" ? "bottom-full mb-2" : "mt-3"
			)}
		>
			{children}
		</ul>
	)
}

export function DropdownItem({ children, onSelect }: { children: ReactNode; onSelect?: () => void }) {
	return (
		<li
			className="p-3 whitespace-nowrap"
			onClick={(e) => {
				e.stopPropagation()
				onSelect?.()
			}}
		>
			{children}
		</li>
	)
}
