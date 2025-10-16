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
		speedMultiplier,
		moon: { moonDistance, moonDistanceMultiplier, moonOrbitSpeed },
	} = useIndexStore((state) => state)

	const speedMultiplierRef = useRef(speedMultiplier)
	speedMultiplierRef.current = speedMultiplier // update ref each render

	const radiusMultiplier = 0.3
	const earth = useEarth({ radiusMultiplier })
	const clouds = useClouds({ radiusMultiplier })
	const moon = useMoon({ segments: 64, radiusMultiplier })

	// store moon pivot persistently (not recreated each render)
	const moonPivotRef = useRef<Object3D | null>(null)

	// create earth and moon once
	useEffect(() => {
		if (!world || !earth || !clouds || !moon) return

		// add clouds to earth
		earth.add(clouds)
		world.add(earth)

		// moon orbit pivot
		const moonPivot = new Object3D()
		moonPivot.rotation.x = MathUtils.degToRad(5)
		moon.position.set(moonDistance * moonDistanceMultiplier, 0, 0)
		moonPivot.add(moon)
		world.add(moonPivot)

		moonPivotRef.current = moonPivot

		return () => {
			world.remove(earth)
			world.remove(moonPivot)
			moonPivotRef.current = null
		}
	}, [world, earth, clouds, moon, moonDistance, moonDistanceMultiplier])

	// handle orbit rotation
	useEffect(() => {
		if (!world || !earth || !clouds || !moon) return

		earth.add(clouds)
		world.add(earth)

		const moonPivot = new Object3D()
		moonPivot.rotation.x = MathUtils.degToRad(5)
		moon.position.set(moonDistance * moonDistanceMultiplier, 0, 0)
		moonPivot.add(moon)
		world.add(moonPivot)

		moonPivotRef.current = moonPivot

		let lastTime = performance.now()
		let frameId: number

		const animate = () => {
			const now = performance.now()
			const delta = (now - lastTime) / 1000
			lastTime = now

			// use the latest speedMultiplier dynamically
			moonPivot.rotateY(moonOrbitSpeed * speedMultiplierRef.current * delta)

			frameId = requestAnimationFrame(animate)
		}

		animate()

		return () => {
			world.remove(earth)
			world.remove(moonPivot)
			moonPivotRef.current = null
			cancelAnimationFrame(frameId)
		}
	}, [world, earth, clouds, moon, moonDistance, moonDistanceMultiplier, moonOrbitSpeed])

	return null
}
