"use client"

import earth_winter_5400x2700 from "@/assets/images/earth_winter_5400x2700.jpg"
import { createAxis } from "@/lib/objects/axis"
import { useIndexStore } from "@/stores"
import { useEffect, useState } from "react"
import { Mesh, MeshStandardMaterial, SphereGeometry, TextureLoader } from "three"

interface EarthConfig {
	radiusMultiplier?: number
	segments?: number
	showAxis?: boolean
}

export function useEarth(config?: EarthConfig) {
	const [earth, setEarth] = useState<Mesh | null>(null)

	const {
		radiusMultiplier,
		speedMultiplier,
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

		if (config?.showAxis) {
			const rotationAxis = createAxis({
				length: earthRadius * 1.33,
			})
			earthMesh.add(rotationAxis)
		}

		setEarth(earthMesh)

		return () => {
			geometry.dispose()
			material.dispose()
			setEarth(null)
		}
	}, [earthRadius, config?.radiusMultiplier, config?.segments, config?.showAxis])

	// rotation
	useEffect(() => {
		if (!earth) return

		let frameId: number
		const rotationSpeed = earthRotationSpeed * speedMultiplier

		const animate = () => {
			frameId = requestAnimationFrame(animate)
			earth.rotateY(rotationSpeed)
		}
		animate()

		return () => cancelAnimationFrame(frameId)
	}, [earth, earthRotationSpeed, speedMultiplier])

	// dynamic scaling
	useEffect(() => {
		if (!earth) return
		const scale = radiusMultiplier * (config?.radiusMultiplier || 1)
		earth.scale.set(scale, scale, scale)
	}, [earth, radiusMultiplier, config?.radiusMultiplier])

	return earth
}
