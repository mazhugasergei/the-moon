"use client"

import earth_winter_5400x2700 from "@/assets/images/earth_winter_5400x2700.jpg"
import { createAxis } from "@/lib/objects/axis"
import { useIndexStore } from "@/stores"
import { useEffect, useRef, useState } from "react"
import { Mesh, MeshStandardMaterial, SphereGeometry, TextureLoader } from "three"

interface EarthConfig {
	radiusMultiplier?: number
	segments?: number
	showAxis?: boolean
}

export function useEarth(config?: EarthConfig): Mesh | null {
	const [earth, setEarth] = useState<Mesh | null>(null)
	const frameIdRef = useRef<number | null>(null)

	const {
		scale: radiusMultiplier,
		speed: speedMultiplier,
		earth: { earthRadius, earthRotationSpeed },
	} = useIndexStore((state) => state)

	// create earth once
	useEffect(() => {
		const loader = new TextureLoader()
		const colorTexture = loader.load(earth_winter_5400x2700.src)

		const geometry = new SphereGeometry(earthRadius, config?.segments || 256, config?.segments || 256)
		const material = new MeshStandardMaterial({
			map: colorTexture,
			roughness: 0.6,
			metalness: 0,
		})

		const earthMesh = new Mesh(geometry, material)
		earthMesh.castShadow = true
		earthMesh.receiveShadow = true
		setEarth(earthMesh)

		return () => {
			geometry.dispose()
			material.dispose()
			setEarth(null)
		}
	}, [earthRadius, config?.segments])

	// rebuild geometry when radius or segments change
	useEffect(() => {
		if (!earth) return
		const oldGeometry = earth.geometry
		const newGeometry = new SphereGeometry(earthRadius, config?.segments || 256, config?.segments || 256)
		earth.geometry = newGeometry
		oldGeometry.dispose()
	}, [earth, earthRadius, config?.segments])

	// rotation
	useEffect(() => {
		if (!earth) return
		let lastTime = performance.now()
		const animate = () => {
			const now = performance.now()
			const delta = (now - lastTime) / 1000
			lastTime = now

			const angularSpeed = earthRotationSpeed * speedMultiplier
			earth.rotateY(angularSpeed * delta)

			frameIdRef.current = requestAnimationFrame(animate)
		}
		animate()
		return () => {
			if (frameIdRef.current !== null) cancelAnimationFrame(frameIdRef.current)
		}
	}, [earth, earthRotationSpeed, speedMultiplier])

	// dynamic scaling
	useEffect(() => {
		if (!earth) return
		const scale = radiusMultiplier * (config?.radiusMultiplier || 1)
		earth.scale.set(scale, scale, scale)
	}, [earth, radiusMultiplier, config?.radiusMultiplier])

	// show axis
	useEffect(() => {
		if (!earth) return
		const existing = earth.getObjectByName("rotationAxis")
		if (existing) earth.remove(existing)

		if (config?.showAxis) {
			const rotationAxis = createAxis({ length: earthRadius * 1.33 })
			rotationAxis.name = "rotationAxis"
			earth.add(rotationAxis)
		}
	}, [earth, config?.showAxis, earthRadius])

	return earth
}
