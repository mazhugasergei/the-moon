import { create } from "zustand"

const defaultState = {
	debug: false,

	selected: "moon" as "earth" | "moon",

	radiusMultiplier: 0.00015,
	speedMultiplier: 100,

	starfield: {
		starCount: 1000,
		starMinDistance: 5000,
		starSpread: 10000,
		starMinSize: 20,
		starMaxSize: 50,
	},

	rotation: {
		dragSpeedFactor: 0.002,
		inertiaDamping: 0.95,
	},

	moon: {
		moonDistanceMultiplier: 0.00001,
		moonDistance: 384400 * 0.00001,
		moonRadius: 1737.4 * 0.00015,
		realMoonRotationSpeed: (2 * Math.PI) / 2_359_200,
		moonRotationSpeed: 0,
		moonRotationAccel: 0.005,
		moonOrbitPeriod: 2_359_200,
		moonOrbitSpeed: 0,
	},

	earth: {
		earthRadius: 6378 * 0.00015,
		realEarthRotationSpeed: (2 * Math.PI) / 86_400,
		earthRotationSpeed: 0,
		earthRotationAccel: 0.005,
	},

	clouds: {
		cloudsRadius: 6378 * 0.00015 * 1.0001,
		cloudsRotationSpeed: -0.00001,
		cloudsRotationAccel: 0.005,
	},

	cursor: {
		cursorHideDelay: 2000,
	},

	zoom: {
		zoomMin: 3,
		zoomMax: 20,
		zoomSpeed: 0.01,
	},

	pitch: {
		pitchMin: -Math.PI / 2,
		pitchMax: Math.PI / 2,
	},

	camera: {
		cameraFov: 40,
		cameraNear: 0.1,
		cameraFar: 5000 + 10000 + 20, // starMinDistance + starSpread + 20
	},

	setSelected: (value: "earth" | "moon") => {},
}

// use the default multiplier
defaultState.moon.moonRotationSpeed = -defaultState.moon.realMoonRotationSpeed * defaultState.speedMultiplier
defaultState.moon.moonOrbitSpeed = ((2 * Math.PI) / defaultState.moon.moonOrbitPeriod) * defaultState.speedMultiplier
defaultState.earth.earthRotationSpeed = -defaultState.earth.realEarthRotationSpeed * defaultState.speedMultiplier
defaultState.clouds.cloudsRotationSpeed = -0.00001 * defaultState.speedMultiplier

export type IndexState = typeof defaultState

export const useIndexStore = create<IndexState>((set) => ({
	...defaultState,
	setSelected: (value) => set({ selected: value }),
}))
