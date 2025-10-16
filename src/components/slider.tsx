"use client"

import { MinusIcon, PlusIcon } from "lucide-react"
import { useEffect, useRef } from "react"

interface Props {
	label: string
	value: number
	min: number
	max: number
	step?: number
	onChange: (v: number) => void
}

export function Slider({ label, value, min, max, step = 1, onChange }: Props) {
	const getDecimals = (num: number) => {
		const str = num.toString()
		if (!str.includes(".")) return 0
		return str.split(".")[1].length
	}
	const decimals = Math.max(getDecimals(min), getDecimals(max), getDecimals(step))

	const intervalRef = useRef<number | null>(null)
	const timeoutRef = useRef<number | null>(null)
	const valueRef = useRef(value)

	// keep latest value in ref to avoid closure issues
	useEffect(() => {
		valueRef.current = value
	}, [value])

	const changeValue = (delta: number) => {
		const newValue = Math.min(Math.max(valueRef.current + delta, min), max)
		onChange(newValue)
	}

	const handleMouseDown = (delta: number) => {
		// immediate change
		changeValue(delta)
		// start interval after 1s hold
		timeoutRef.current = window.setTimeout(() => {
			intervalRef.current = window.setInterval(() => changeValue(delta), 100)
		}, 500)
	}

	const handleMouseUp = () => {
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
		if (intervalRef.current !== null) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
	}

	return (
		<div className="flex flex-col px-3 py-2">
			<label className="mb-1 flex items-center justify-between">
				<span>{label}:</span>
				<span style={{ display: "inline-block", width: `${decimals + 3}ch`, textAlign: "right" }}>
					{value.toFixed(decimals)}
				</span>
			</label>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onMouseDown={() => handleMouseDown(-step)}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
					className="rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
				>
					<MinusIcon size={16} />
				</button>
				<input
					type="range"
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={(e) => onChange(Number(e.target.value))}
					className="w-full"
				/>
				<button
					type="button"
					onMouseDown={() => handleMouseDown(step)}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
					className="rounded p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
				>
					<PlusIcon size={16} />
				</button>
			</div>
		</div>
	)
}
