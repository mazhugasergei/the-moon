import { BufferGeometry, Color, Float32BufferAttribute, Points, ShaderMaterial } from "three"

interface StarfieldConfig {
	count?: number
	spread?: number
	minSize?: number
	maxSize?: number
	color?: number
}

export function createStarfield({
	count = 10000,
	spread = 2000,
	minSize = 0.3,
	maxSize = 1,
	color = 0xffffff,
}: StarfieldConfig = {}) {
	const geometry = new BufferGeometry()
	const positions: number[] = []
	const sizes: number[] = []

	for (let i = 0; i < count; i++) {
		const x = (Math.random() - 0.5) * spread
		const y = (Math.random() - 0.5) * spread
		const z = (Math.random() - 0.5) * spread
		positions.push(x, y, z)
		sizes.push(minSize + Math.random() * (maxSize - minSize))
	}

	geometry.setAttribute("position", new Float32BufferAttribute(positions, 3))
	geometry.setAttribute("size", new Float32BufferAttribute(sizes, 1))

	const material = new ShaderMaterial({
		uniforms: { color: { value: new Color(color) } },
		vertexShader: `
			attribute float size;
			varying vec3 vColor;
			void main() {
				vColor = vec3(${new Color(color).r.toFixed(3)}, ${new Color(color).g.toFixed(3)}, ${new Color(color).b.toFixed(3)});
				vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
				gl_PointSize = size * (300.0 / -mvPosition.z);
				gl_Position = projectionMatrix * mvPosition;
			}
		`,
		fragmentShader: `
			varying vec3 vColor;
			void main() {
				if (length(gl_PointCoord - 0.5) > 0.5) discard;
				gl_FragColor = vec4(vColor, 1.0);
			}
		`,
	})

	const stars = new Points(geometry, material)
	return stars
}
