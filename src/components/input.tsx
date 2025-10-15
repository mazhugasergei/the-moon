interface Props {
	label: string
	value: number | string
	onChange: (v: number | string) => void
}

export function CustomInput({ label, value, onChange }: Props) {
	return (
		<div className="flex items-center justify-between px-3 py-2">
			<label>{label}</label>
			<input
				type="number"
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				className="ml-2 w-16 rounded border px-1 text-right"
			/>
		</div>
	)
}
