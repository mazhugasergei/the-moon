"use client"

import ldem_3_8bit from "@/assets/images/ldem_3_8bit.jpg"
import lroc_color_poles_1k from "@/assets/images/lroc_color_poles_1k.jpg"
import { useIndexStore } from "@/stores"
import { useEffect, useRef, useState } from "react"
import { Mesh, MeshStandardMaterial, SphereGeometry, TextureLoader } from "three"
import { createAxis } from "../lib/objects/axis"

interface Config {
	showAxis?: boolean
	segments?: number
	radiusMultiplier?: number
}

export function useMoon(config?: Config): Mesh | null {
	const [moon, setMoon] = useState<Mesh | null>(null)
	const frameIdRef = useRef<number | null>(null)

	const {
		scale: radiusMultiplier,
		speed: speedMultiplier,
		moon: { moonRadius, moonRotationSpeed },
	} = useIndexStore((state) => state)

	// create moon once
	useEffect(() => {
		const loader = new TextureLoader()
		const colorTexture = loader.load(lroc_color_poles_1k.src)
		const bumpTexture = loader.load(ldem_3_8bit.src)

		const geometry = new SphereGeometry(moonRadius, config?.segments || 256, config?.segments || 256)
		const material = new MeshStandardMaterial({
			map: colorTexture,
			bumpMap: bumpTexture,
			bumpScale: 2,
			displacementMap: bumpTexture,
			displacementScale: 0.05,
			roughness: 0.7,
			metalness: 0,
		})

		const moonMesh = new Mesh(geometry, material)
		moonMesh.castShadow = true
		moonMesh.receiveShadow = true

		// initial axis
		if (config?.showAxis) {
			const rotationAxis = createAxis({ length: moonRadius * 1.33 })
			rotationAxis.name = "rotationAxis"
			moonMesh.add(rotationAxis)
		}

		setMoon(moonMesh)

		return () => {
			geometry.dispose()
			material.dispose()
			setMoon(null)
		}
	}, [moonRadius, config?.segments, config?.showAxis])

	// rotation
	useEffect(() => {
		if (!moon) return
		let lastTime = performance.now()

		const animate = () => {
			const now = performance.now()
			const delta = (now - lastTime) / 1000
			lastTime = now

			const angularSpeed = moonRotationSpeed * speedMultiplier
			moon.rotateY(angularSpeed * delta)

			frameIdRef.current = requestAnimationFrame(animate)
		}
		animate()

		return () => {
			if (frameIdRef.current !== null) cancelAnimationFrame(frameIdRef.current)
		}
	}, [moon, moonRotationSpeed, speedMultiplier])

	// dynamic scaling
	useEffect(() => {
		if (!moon) return
		const scale = radiusMultiplier * (config?.radiusMultiplier || 1)
		moon.scale.set(scale, scale, scale)
	}, [moon, radiusMultiplier, config?.radiusMultiplier])

	// update segments
	useEffect(() => {
		if (!moon) return
		const oldGeometry = moon.geometry
		const newGeometry = new SphereGeometry(moonRadius, config?.segments || 256, config?.segments || 256)
		moon.geometry = newGeometry
		oldGeometry.dispose()
	}, [moon, config?.segments, moonRadius])

	// update axis visibility
	useEffect(() => {
		if (!moon) return

		// remove existing axis
		const existing = moon.getObjectByName("rotationAxis")
		if (existing) moon.remove(existing)

		// add new one if enabled
		if (config?.showAxis) {
			const rotationAxis = createAxis({ length: moonRadius * 1.33 })
			rotationAxis.name = "rotationAxis"
			moon.add(rotationAxis)
		}
	}, [moon, config?.showAxis, moonRadius])

	return moon
}
