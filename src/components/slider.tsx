interface Props {
	label: string
	value: number
	min: number
	max: number
	step?: number
	onChange: (v: number) => void
}

export function Slider({ label, value, min, max, step = 1, onChange }: Props) {
	// determine the max decimal places among min, max, step
	const getDecimals = (num: number) => {
		const str = num.toString()
		if (!str.includes(".")) return 0
		return str.split(".")[1].length
	}
	const decimals = Math.max(getDecimals(min), getDecimals(max), getDecimals(step))

	return (
		<div className="flex flex-col px-3 py-2">
			<label className="mb-1 flex items-center justify-between">
				<span>{label}:</span>
				<span style={{ display: "inline-block", width: `${decimals + 2 + 1}ch`, textAlign: "right" }}>
					{value.toFixed(decimals)}
				</span>
			</label>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				className="w-full"
			/>
		</div>
	)
}
