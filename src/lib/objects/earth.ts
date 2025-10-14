import earth_winter_5400x2700 from "@/assets/images/earth_winter_5400x2700.jpg"
import {
	BufferGeometry,
	Line,
	LineBasicMaterial,
	Mesh,
	MeshStandardMaterial,
	SphereGeometry,
	TextureLoader,
	Vector3,
} from "three"

interface EarthConfig {
	radius?: number
	segments?: number
	showAxis?: boolean
}

export function createEarth({ radius = 1, segments = 256, showAxis = false }: EarthConfig = {}) {
	const loader = new TextureLoader()
	const colorTexture = loader.load(earth_winter_5400x2700.src)

	const geometry = new SphereGeometry(radius, segments, segments)

	const material = new MeshStandardMaterial({
		map: colorTexture,
		roughness: 0.6,
		metalness: 0,
	})

	const earth = new Mesh(geometry, material)

	if (showAxis) {
		const axisMaterial = new LineBasicMaterial({ color: 0xffffff })
		const axisGeometry = new BufferGeometry().setFromPoints([
			new Vector3(0, -radius * 1.33, 0),
			new Vector3(0, radius * 1.33, 0),
		])
		const rotationAxis = new Line(axisGeometry, axisMaterial)
		earth.add(rotationAxis)
	}

	return earth
}
