import { AmbientLight, Light, PointLight } from "three"

interface LightConfig {
	type?: "point" | "ambient"
	color?: number
	intensity?: number
	position?: [number, number, number] // only for point lights
}

export function createLight({
	type = "point",
	color = 0xffffff,
	intensity = 0,
	position = [0, 0, 0],
}: LightConfig = {}): Light {
	if (type === "ambient") {
		return new AmbientLight(color, intensity)
	} else {
		const light = new PointLight(color, intensity)
		light.position.set(...position)
		return light
	}
}
