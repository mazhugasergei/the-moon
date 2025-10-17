"use client"

import { useClouds } from "@/hooks/use-clouds"
import { useEarth } from "@/hooks/use-earth"
import { useMoon } from "@/hooks/use-moon"
import { useIndexStore } from "@/stores"
import { useEffect, useRef } from "react"
import { MathUtils, Object3D } from "three"

interface Props {
	world: Object3D | null
}

export function Earth({ world }: Props) {
	if (!world) return null

	const {
		radiusMultiplier,
		speedMultiplier,
		moon: { moonDistance, moonDistanceMultiplier, moonOrbitSpeed },
	} = useIndexStore((state) => state)

	const speedMultiplierRef = useRef(speedMultiplier)
	speedMultiplierRef.current = speedMultiplier

	const _radiusMultiplier = 0.3
	const earth = useEarth({ radiusMultiplier: _radiusMultiplier })
	const clouds = useClouds({ radiusMultiplier: _radiusMultiplier })
	const moon = useMoon({ segments: 64, radiusMultiplier: _radiusMultiplier })
	const moonPivotRef = useRef<Object3D | null>(null)

	useEffect(() => {
		if (!world || !earth || !clouds || !moon) return

		// add clouds to earth
		earth.add(clouds)
		world.add(earth)

		// moon orbit pivot
		const moonPivot = new Object3D()
		moonPivot.rotation.x = MathUtils.degToRad(5)

		// real moon distance scaled down by both multipliers
		const scaledDistance = moonDistance * moonDistanceMultiplier * radiusMultiplier

		moon.position.set(scaledDistance, 0, 0)
		moonPivot.add(moon)
		world.add(moonPivot)

		moonPivotRef.current = moonPivot

		return () => {
			world.remove(earth)
			world.remove(moonPivot)
			moonPivotRef.current = null
		}
	}, [world, earth, clouds, moon, moonDistance, moonDistanceMultiplier, radiusMultiplier])

	// orbit rotation
	useEffect(() => {
		let lastTime = performance.now()
		let frameId: number

		const animate = () => {
			const now = performance.now()
			const delta = (now - lastTime) / 1000
			lastTime = now

			moonPivotRef.current?.rotateY(moonOrbitSpeed * speedMultiplierRef.current * delta)
			frameId = requestAnimationFrame(animate)
		}

		animate()
		return () => cancelAnimationFrame(frameId)
	}, [moonOrbitSpeed])

	return null
}
