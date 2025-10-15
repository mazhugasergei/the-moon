"use client"

import earth_clouds from "@/assets/images/Earth-clouds.png"
import { useIndexStore } from "@/stores"
import { useEffect, useState } from "react"
import { Mesh, MeshStandardMaterial, SphereGeometry, TextureLoader } from "three"

interface CloudsConfig {
	radiusMultiplier?: number
	segments?: number
}

export function useClouds(config?: CloudsConfig) {
	const [clouds, setClouds] = useState<Mesh | null>(null)

	const {
		clouds: { cloudsRadius },
	} = useIndexStore((state) => state)

	useEffect(() => {
		const loader = new TextureLoader()
		const cloudTexture = loader.load(earth_clouds.src)

		const geometry = new SphereGeometry(
			cloudsRadius * (config?.radiusMultiplier || 1),
			config?.segments || 256,
			config?.segments || 256
		)

		const material = new MeshStandardMaterial({
			map: cloudTexture,
			transparent: true,
			opacity: 0.8,
			depthWrite: false,
		})

		const cloudMesh = new Mesh(geometry, material)
		setClouds(cloudMesh)

		return () => {
			setClouds(null)
		}
	}, [cloudsRadius, config?.radiusMultiplier, config?.segments])

	return clouds
}
