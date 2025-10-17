"use client"

import { EllipsisVerticalIcon } from "lucide-react"
import { useIndexStore } from "../stores"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "./dropdown"
import { Slider } from "./slider"

export function Footer() {
	const debug = useIndexStore((state) => state.debug)
	const {
		selected,
		scale,
		speed,
		moon: { moonDistanceMultiplier },
	} = useIndexStore((state) => state)
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
							label="Scale"
							value={scale}
							min={0}
							max={0.001}
							step={0.00001}
							onChange={(v) => updateConfig({ scale: v })}
						/>
					</DropdownItem>
					<DropdownItem>
						<Slider
							label="Speed"
							valuePrefix="x"
							value={speed}
							min={1}
							max={1000001}
							step={10}
							onChange={(v) => updateConfig({ speed: v })}
						/>
					</DropdownItem>
					{selected === "earth" && (
						<DropdownItem>
							<Slider
								label="Moon distance"
								valuePrefix="x"
								value={moonDistanceMultiplier}
								min={0}
								max={1}
								step={0.005}
								onChange={(v) => updateConfig({ moon: { moonDistanceMultiplier: v } })}
							/>
						</DropdownItem>
					)}
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
