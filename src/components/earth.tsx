"use client"

import { useClouds } from "@/hooks/use-clouds"
import { useEarth } from "@/hooks/use-earth"
import { useMoon } from "@/hooks/use-moon"
import { useIndexStore } from "@/stores"
import { useEffect } from "react"
import { MathUtils, Object3D } from "three"

interface Props {
	world: Object3D
}

export function Earth({ world }: Props) {
	const {
		moon: { moonDistance },
	} = useIndexStore((state) => state)

	const earth = useEarth({ radiusMultiplier: 1 })
	const clouds = useClouds()
	const moon = useMoon({ segments: 64 })

	useEffect(() => {
		if (!earth || !clouds || !moon) return

		earth.add(clouds)
		world.add(earth)

		// moon pivot for orbit
		const moonPivot = new Object3D()
		moonPivot.rotation.x = MathUtils.degToRad(5)
		moon.position.set(moonDistance, 0, 0)
		moonPivot.add(moon)
		world.add(moonPivot)

		return () => {
			world.remove(earth)
			world.remove(moonPivot)
		}
	}, [world, earth, clouds, moon, moonDistance])

	return null
}
