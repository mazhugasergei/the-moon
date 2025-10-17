"use client"

import { MinusIcon, PlusIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import { Button } from "./button"

interface Props {
	label: string
	valuePrefix?: string
	valueSuffix?: string
	value: number
	min: number
	max: number
	step?: number
	onChange: (v: number) => void
}

export function Slider({ label, valuePrefix, valueSuffix, value, min, max, step = 1, onChange }: Props) {
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
		<div className="flex flex-col space-y-1">
			<label className="flex items-center justify-between gap-4">
				<span>{label}</span>
				<span className="text-right">
					{valuePrefix}
					{value.toFixed(decimals)}
					{valueSuffix}
				</span>
			</label>

			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="ghost"
					onMouseDown={() => handleMouseDown(-step)}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
				>
					<MinusIcon size={16} />
				</Button>
				<input
					type="range"
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={(e) => onChange(Number(e.target.value))}
					className="w-full min-w-40"
				/>
				<Button
					type="button"
					variant="ghost"
					onMouseDown={() => handleMouseDown(step)}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
				>
					<PlusIcon size={16} />
				</Button>
			</div>
		</div>
	)
}
