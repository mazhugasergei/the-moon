"use client"

import earth_clouds from "@/assets/images/Earth-clouds.png"
import { useIndexStore } from "@/stores"
import { useEffect, useRef, useState } from "react"
import { Mesh, MeshStandardMaterial, SphereGeometry, TextureLoader } from "three"

interface CloudsConfig {
	radiusMultiplier?: number
	segments?: number
}

export function useClouds(config?: CloudsConfig) {
	const [clouds, setClouds] = useState<Mesh | null>(null)
	const frameIdRef = useRef<number | null>(null)

	const {
		radiusMultiplier,
		speedMultiplier,
		earth: { earthRadius },
		clouds: { cloudsRotationSpeed },
	} = useIndexStore((state) => state)

	// create clouds once
	useEffect(() => {
		const loader = new TextureLoader()
		const cloudTexture = loader.load(earth_clouds.src)

		const geometry = new SphereGeometry(earthRadius + 1, config?.segments || 256, config?.segments || 256)
		const material = new MeshStandardMaterial({
			map: cloudTexture,
			transparent: true,
			opacity: 0.8,
			depthWrite: false,
		})

		const cloudMesh = new Mesh(geometry, material)
		setClouds(cloudMesh)

		return () => {
			geometry.dispose()
			material.dispose()
			setClouds(null)
		}
	}, [earthRadius, config?.radiusMultiplier, config?.segments])

	// rotation
	useEffect(() => {
		if (!clouds) return
		let lastTime = performance.now()

		const animate = () => {
			const now = performance.now()
			const delta = (now - lastTime) / 1000
			lastTime = now

			const angularSpeed = cloudsRotationSpeed * speedMultiplier
			clouds.rotateY(angularSpeed * delta)

			frameIdRef.current = requestAnimationFrame(animate)
		}

		animate()

		return () => {
			if (frameIdRef.current !== null) cancelAnimationFrame(frameIdRef.current)
		}
	}, [clouds, cloudsRotationSpeed, speedMultiplier])

	return clouds
}
