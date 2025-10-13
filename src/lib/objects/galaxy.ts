import { BackSide, Color, Mesh, MeshBasicMaterial, SphereGeometry, SRGBColorSpace, TextureLoader } from "three"

import nebulaImg from "@/assets/images/galactic_plane_hazy_nebulae_1.jpg"

interface SpaceSphereConfig {
	radius?: number
	segments?: number
	color?: number
}

export function createSpaceSphere({ radius = 1000, segments = 64, color = 0xffffff }: SpaceSphereConfig = {}): Mesh {
	const texture = new TextureLoader().load(nebulaImg.src)
	texture.colorSpace = SRGBColorSpace

	const geometry = new SphereGeometry(radius, segments, segments)
	const material = new MeshBasicMaterial({
		map: texture,
		color: new Color(color),
		side: BackSide,
		depthWrite: false,
	})

	const sphere = new Mesh(geometry, material)
	return sphere
}
