"use client"

import { cn } from "@/utils"
import { useEffect, useRef, useState } from "react"

interface Option {
	label: string
	value: string | number
}

interface CustomSelectProps {
	options: Option[]
	value: string | number
	onChange: (value: string | number) => void
	placeholder?: string
}

export function CustomSelect({ options, value, onChange, placeholder }: CustomSelectProps) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	// close when clicking outside
	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener("mousedown", handleClick)
		return () => document.removeEventListener("mousedown", handleClick)
	}, [])

	const selectedOption = options.find((opt) => opt.value === value)

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				className="flex w-full cursor-pointer items-center justify-between rounded text-left"
				onClick={() => setOpen((prev) => !prev)}
			>
				<span>{selectedOption?.label ?? placeholder ?? "Select"}</span>
				<span className="ml-2">{open ? "▲" : "▼"}</span>
			</button>

			{open && (
				<ul className="absolute right-0 z-10 mt-3 max-h-60 overflow-auto rounded border border-white/20 shadow">
					{options.map((opt) => (
						<li
							key={opt.value}
							className={cn(
								"cursor-pointer bg-black px-3 py-2",
								opt.value !== value && "hover:bg-white/20",
								opt.value === value && "bg-white/10 font-semibold"
							)}
							onClick={() => {
								onChange(opt.value)
								setOpen(false)
							}}
						>
							{opt.label}
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
