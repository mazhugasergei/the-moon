"use client"

import { EllipsisVerticalIcon } from "lucide-react"
import { useIndexStore } from "../stores"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "./dropdown"
import { Slider } from "./slider"

export function Footer() {
	const debug = useIndexStore((state) => state.debug)
	const { radiusMultiplier, speedMultiplier } = useIndexStore((state) => state)
	const updateConfig = useIndexStore((state) => state.updateConfig)
	const resetConfig = useIndexStore((state) => state.resetConfig)

	return (
		<footer className="text-muted fixed right-0 bottom-0 left-0 flex items-center justify-end p-4">
			<Dropdown>
				<DropdownTrigger>
					<EllipsisVerticalIcon size={16} />
				</DropdownTrigger>
				<DropdownContent alignX="right" alignY="top">
					<DropdownItem>
						<Checkbox label="Debug menu" checked={debug} onChange={(v) => updateConfig({ debug: v })} />
					</DropdownItem>
					{/* <DropdownItem>
						<CustomInput
							label="Radius Multiplier"
							value={radiusMultiplier}
							onChange={(v) => updateConfig({ radiusMultiplier: Number(v) })}
						/>
					</DropdownItem> */}
					<DropdownItem>
						<Slider
							label="Radius Multiplier"
							value={radiusMultiplier}
							min={0}
							max={0.001}
							step={0.00001}
							onChange={(v) => updateConfig({ radiusMultiplier: v })}
						/>
					</DropdownItem>
					<DropdownItem>
						<Slider
							label="Speed Multiplier"
							value={speedMultiplier}
							min={1}
							max={50001}
							step={10}
							onChange={(v) => updateConfig({ speedMultiplier: v })}
						/>
					</DropdownItem>
					<DropdownItem>
						<Button variant="outline" onClick={resetConfig} className="w-full">
							Reset
						</Button>
					</DropdownItem>
				</DropdownContent>
			</Dropdown>
		</footer>
	)
}
