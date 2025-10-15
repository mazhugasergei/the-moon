"use client"

import { cn } from "@/utils"
import { ChevronDownIcon } from "lucide-react"
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react"

interface SelectContextValue {
	open: boolean
	setOpen: (v: boolean) => void
	value: string | number | undefined
	onChange: (v: string | number) => void
}

const SelectContext = createContext<SelectContextValue | null>(null)

function useSelect() {
	const ctx = useContext(SelectContext)
	if (!ctx) throw new Error("Select components must be used within <Select>")
	return ctx
}

interface SelectProps {
	value: string | number | undefined
	onChange: (v: string | number) => void
	children: ReactNode
}

export function Select({ value, onChange, children }: SelectProps) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener("mousedown", handleClick)
		return () => document.removeEventListener("mousedown", handleClick)
	}, [])

	return (
		<SelectContext.Provider value={{ open, setOpen, value, onChange }}>
			<div ref={ref} className="relative">
				{children}
			</div>
		</SelectContext.Provider>
	)
}

export function SelectTrigger({ children }: { children: ReactNode }) {
	const { open, setOpen } = useSelect()
	return (
		<button
			type="button"
			onClick={() => setOpen(!open)}
			className="flex w-full cursor-pointer items-center justify-between gap-1 rounded text-left"
		>
			{children}
			<ChevronDownIcon size={14} className={cn("transition-transform", open && "rotate-180")} />
		</button>
	)
}

interface SelectContentProps {
	children: ReactNode
	alignX?: "left" | "right"
	alignY?: "top" | "bottom"
}

export function SelectContent({ children, alignX = "right", alignY = "bottom" }: SelectContentProps) {
	const { open } = useSelect()
	if (!open) return null

	return (
		<ul
			className={cn(
				"bg-background absolute z-10 max-h-60 overflow-auto rounded border",
				alignX === "left" ? "left-0" : "right-0",
				alignY === "top" ? "bottom-full mb-2" : "mt-3"
			)}
		>
			{children}
		</ul>
	)
}

export function SelectItem({ value, children }: { value: string | number; children: ReactNode }) {
	const { onChange, setOpen, value: selected } = useSelect()
	const active = selected === value

	return (
		<li
			className={cn(
				"cursor-pointer px-3 py-2 whitespace-nowrap",
				active ? "text-muted-foreground bg-white/10 font-semibold" : "hover:bg-white/20"
			)}
			onClick={() => {
				onChange(value)
				setOpen(false)
			}}
		>
			{children}
		</li>
	)
}
