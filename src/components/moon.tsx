"use client"

import { useMoon } from "@/hooks/use-moon"
import { useEffect } from "react"
import { Object3D } from "three"

interface Props {
	world: Object3D
}

export function Moon({ world }: Props) {
	const moon = useMoon({ radiusMultiplier: 3 })

	useEffect(() => {
		if (!moon) return
		world.add(moon)

		return () => {
			world.remove(moon)
		}
	}, [world, moon])

	return null
}
