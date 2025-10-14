import ldem_3_8bit from "@/assets/images/ldem_3_8bit.jpg"
import lroc_color_poles_1k from "@/assets/images/lroc_color_poles_1k.jpg"
import { Mesh, MeshStandardMaterial, SphereGeometry, TextureLoader } from "three"
import { MOON_RADIUS } from "../constants"
import { createAxis } from "./axis"

interface MoonConfig {
	radius?: number
	radiusMultiplier?: number
	segments?: number
	bumpScale?: number
	displacementScale?: number
	showAxis?: boolean
}

export function createMoon({
	radius = MOON_RADIUS,
	radiusMultiplier = 1,
	segments = 256,
	bumpScale = 2,
	displacementScale = 0.05,
	showAxis = false,
}: MoonConfig = {}) {
	const loader = new TextureLoader()
	const colorTexture = loader.load(lroc_color_poles_1k.src)
	const bumpTexture = loader.load(ldem_3_8bit.src)

	const geometry = new SphereGeometry(radius * radiusMultiplier, segments, segments)

	const material = new MeshStandardMaterial({
		map: colorTexture,
		bumpMap: bumpTexture,
		bumpScale: bumpScale * radius * Math.max(radiusMultiplier, 0.001), // scaled consistently
		displacementMap: bumpTexture,
		displacementScale: displacementScale * radius * Math.max(radiusMultiplier, 0.001),
		roughness: 0.7,
		metalness: 0,
	})

	const moon = new Mesh(geometry, material)

	if (showAxis) {
		if (showAxis) {
			const rotationAxis = createAxis({ length: radius * 1.33 })
			moon.add(rotationAxis)
		}
	}

	return moon
}
