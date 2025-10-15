"use client"

import ldem_3_8bit from "@/assets/images/ldem_3_8bit.jpg"
import lroc_color_poles_1k from "@/assets/images/lroc_color_poles_1k.jpg"
import { useIndexStore } from "@/stores"
import { useEffect, useState } from "react"
import { Mesh, MeshStandardMaterial, SphereGeometry, TextureLoader } from "three"
import { createAxis } from "../lib/objects/axis"

interface Config {
	showAxis?: boolean
	segments?: number
	radiusMultiplier?: number
}

export function useMoon(config?: Config) {
	const [moon, setMoon] = useState<Mesh | null>(null)

	const {
		moon: { moonRadius, moonRotationSpeed, moonRotationAccel },
	} = useIndexStore((state) => state)

	useEffect(() => {
		const loader = new TextureLoader()
		const colorTexture = loader.load(lroc_color_poles_1k.src)
		const bumpTexture = loader.load(ldem_3_8bit.src)

		const geometry = new SphereGeometry(
			moonRadius * (config?.radiusMultiplier || 1),
			config?.segments || 256,
			config?.segments || 256
		)

		const material = new MeshStandardMaterial({
			map: colorTexture,
			bumpMap: bumpTexture,
			bumpScale: 2 * moonRadius,
			displacementMap: bumpTexture,
			displacementScale: 0.05 * moonRadius,
			roughness: 0.7,
			metalness: 0,
		})

		const moonMesh = new Mesh(geometry, material)
		moonMesh.castShadow = true
		moonMesh.receiveShadow = true

		// rotation
		let rotationSpeed = 0
		const animate = () => {
			requestAnimationFrame(animate)
			rotationSpeed += (moonRotationSpeed - rotationSpeed) * moonRotationAccel
			moonMesh.rotateY(-rotationSpeed)
		}
		animate()

		// axis
		if (config?.showAxis) {
			const rotationAxis = createAxis({ length: moonRadius * 1.33 })
			moonMesh.add(rotationAxis)
		}

		setMoon(moonMesh)

		return () => {
			setMoon(null)
		}
	}, [moonRadius, config?.radiusMultiplier, config?.segments, config?.showAxis])

	return moon
}
