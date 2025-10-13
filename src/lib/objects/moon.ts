import ldem_3_8bit from "@/assets/images/ldem_3_8bit.jpg"
import lroc_color_poles_1k from "@/assets/images/lroc_color_poles_1k.jpg"
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

interface MoonConfig {
	radius?: number
	showAxis?: boolean
}

export function createMoon({ radius = 0.8, showAxis = false }: MoonConfig = {}) {
	const loader = new TextureLoader()
	const colorTexture = loader.load(lroc_color_poles_1k.src)
	const bumpTexture = loader.load(ldem_3_8bit.src)

	const geometry = new SphereGeometry(radius, 256, 256)

	// Base scales for radius = 1
	const baseRadius = 1
	const baseBumpScale = 0.2
	const baseDisplacementScale = 0.05

	const material = new MeshStandardMaterial({
		map: colorTexture,
		bumpMap: bumpTexture,
		bumpScale: baseBumpScale * (baseRadius / radius),
		displacementMap: bumpTexture,
		displacementScale: baseDisplacementScale * (baseRadius / radius),
		roughness: 0.7,
		metalness: 0,
	})

	const moon = new Mesh(geometry, material)

	if (showAxis) {
		const axisMaterial = new LineBasicMaterial({ color: 0xffffff })
		const axisGeometry = new BufferGeometry().setFromPoints([
			new Vector3(0, -radius * 1.33, 0),
			new Vector3(0, radius * 1.33, 0),
		])
		const rotationAxis = new Line(axisGeometry, axisMaterial)
		moon.add(rotationAxis)
	}

	return moon
}
