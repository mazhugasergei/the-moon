import earth_winter_5400x2700 from "@/assets/images/earth_winter_5400x2700.jpg"
import { Mesh, MeshStandardMaterial, SphereGeometry, TextureLoader } from "three"
import { EARTH_RADIUS } from "../constants"
import { createAxis } from "./axis"

interface EarthConfig {
	radius?: number
	radiusMultiplier?: number
	segments?: number
	showAxis?: boolean
}

export function createEarth({
	radius = EARTH_RADIUS,
	radiusMultiplier = 1,
	segments = 256,
	showAxis = false,
}: EarthConfig = {}) {
	const loader = new TextureLoader()
	const colorTexture = loader.load(earth_winter_5400x2700.src)

	const geometry = new SphereGeometry(radius * radiusMultiplier, segments, segments)

	const material = new MeshStandardMaterial({
		map: colorTexture,
		roughness: 0.6,
		metalness: 0,
	})

	const earth = new Mesh(geometry, material)

	if (showAxis) {
		const rotationAxis = createAxis({ length: radius * radiusMultiplier * 1.33 })
		earth.add(rotationAxis)
	}

	return earth
}
