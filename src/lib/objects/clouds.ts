import earth_clouds from "@/assets/images/Earth-clouds.png"
import { Mesh, MeshStandardMaterial, SphereGeometry, TextureLoader } from "three"

interface CloudsConfig {
	radius?: number
}

export function createClouds({ radius = 1 }: CloudsConfig = {}) {
	const loader = new TextureLoader()
	const cloudTexture = loader.load(earth_clouds.src)

	const geometry = new SphereGeometry(radius * 1.001, 256, 256)
	const material = new MeshStandardMaterial({
		map: cloudTexture,
		transparent: true,
		opacity: 0.7,
		depthWrite: false,
	})

	return new Mesh(geometry, material)
}
