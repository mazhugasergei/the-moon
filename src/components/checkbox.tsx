import { cn } from "@/utils"
import { CheckIcon } from "lucide-react"
import { useState } from "react"

interface CheckboxProps {
	checked?: boolean
	onChange?: (checked: boolean) => void
	label?: string
	disabled?: boolean
}

export function Checkbox({ checked: controlled, onChange, label, disabled }: CheckboxProps) {
	const [internalChecked, setInternalChecked] = useState(controlled ?? false)
	const isControlled = controlled !== undefined
	const checked = isControlled ? controlled : internalChecked

	const toggle = () => {
		if (disabled) return
		const next = !checked
		if (!isControlled) setInternalChecked(next)
		onChange?.(next)
	}

	return (
		<label
			className={cn(
				"flex cursor-pointer items-center gap-2 select-none",
				disabled ? "cursor-not-allowed opacity-50" : ""
			)}
			onClick={toggle}
		>
			<div
				className={`flex h-4 w-4 items-center justify-center rounded-sm border transition-colors ${checked ? "border-blue-600 bg-blue-600" : "border-gray-400"} `}
			>
				{checked && <CheckIcon size={12} className="text-white" />}
			</div>
			{label && <span className="text-sm">{label}</span>}
		</label>
	)
}
