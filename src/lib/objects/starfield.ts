import { BufferGeometry, Color, Float32BufferAttribute, Points, ShaderMaterial } from "three"
import { STAR_COUNT, STAR_MAX_SIZE, STAR_MIN_DISTANCE, STAR_MIN_SIZE, STAR_SPREAD } from "../constants"

interface StarfieldConfig {
	count?: number
	spread?: number
	minDistance?: number
	minSize?: number
	maxSize?: number
	color?: number
}

export function createStarfield({
	count = STAR_COUNT,
	spread = STAR_SPREAD,
	minDistance = STAR_MIN_DISTANCE,
	minSize = STAR_MIN_SIZE,
	maxSize = STAR_MAX_SIZE,
	color = 0xffffff,
}: StarfieldConfig = {}) {
	const geometry = new BufferGeometry()
	const positions: number[] = []
	const sizes: number[] = []

	for (let i = 0; i < count; i++) {
		const r = minDistance + Math.random() * (spread - minDistance)
		const theta = Math.random() * Math.PI * 2
		const phi = Math.acos(2 * Math.random() - 1)

		const x = r * Math.sin(phi) * Math.cos(theta)
		const y = r * Math.sin(phi) * Math.sin(theta)
		const z = r * Math.cos(phi)

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
				
				// scale points with distance but clamp to avoid disappearing
				float distance = max(1.0, -mvPosition.z);
				gl_PointSize = clamp(size * (300.0 / distance), 1.0, 50.0);

				gl_Position = projectionMatrix * mvPosition;
			}
		`,
		fragmentShader: `
			varying vec3 vColor;
			void main() {
				// make points round
				if (length(gl_PointCoord - 0.5) > 0.5) discard;
				gl_FragColor = vec4(vColor, 1.0);
			}
		`,
	})

	return new Points(geometry, material)
}
