import earth_clouds from "@/assets/images/Earth-clouds.png"
import { Mesh, MeshStandardMaterial, SphereGeometry, TextureLoader } from "three"
import { CLOUDS_RADIUS } from "../constants"

interface CloudsConfig {
	radius?: number
	radiusMultiplier?: number
	segments?: number
}

export function createClouds({ radius = CLOUDS_RADIUS, radiusMultiplier = 1, segments = 256 }: CloudsConfig = {}) {
	const loader = new TextureLoader()
	const cloudTexture = loader.load(earth_clouds.src)

	const geometry = new SphereGeometry(radius * radiusMultiplier, segments, segments)
	const material = new MeshStandardMaterial({
		map: cloudTexture,
		transparent: true,
		opacity: 0.8,
		depthWrite: false,
	})

	return new Mesh(geometry, material)
}
