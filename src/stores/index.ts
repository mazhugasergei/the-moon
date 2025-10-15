import { create } from "zustand"

type State = {
	debug: boolean
	selected: SelectedObject
	radiusMultiplier: number
	speedMultiplier: number
	starfield: {
		starCount: number
		starMinDistance: number
		starSpread: number
		starMinSize: number
		starMaxSize: number
	}
	rotation: {
		dragSpeedFactor: number
		inertiaDamping: number
	}
	moon: {
		moonDistanceMultiplier: number
		moonDistance: number
		moonRadius: number
		moonRotationSpeed: number
		moonRotationAccel: number
		moonOrbitSpeed: number
	}
	earth: {
		earthRadius: number
		earthRotationSpeed: number
		earthRotationAccel: number
	}
	clouds: {
		cloudsRadius: number
		cloudsRotationSpeed: number
		cloudsRotationAccel: number
	}
	cursor: {
		cursorHideDelay: number
	}
	zoom: {
		zoomMin: number
		zoomMax: number
		zoomSpeed: number
	}
	pitch: {
		pitchMin: number
		pitchMax: number
	}
	camera: {
		cameraFov: number
		cameraNear: number
		cameraFar: number
	}
	setSelected: (value: SelectedObject) => void
	updateConfig: (partial: Partial<State>) => void
	resetConfig: () => void
}

const defaultState: State = {
	debug: false,
	selected: "moon",
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
		moonDistance: 384400,
		moonRadius: 1737.4,
		moonRotationSpeed: (2 * Math.PI) / 2_359_200,
		moonRotationAccel: 0.005,
		moonOrbitSpeed: (2 * Math.PI) / 2_359_200,
	},
	earth: {
		earthRadius: 6378,
		earthRotationSpeed: (2 * Math.PI) / 86_400,
		earthRotationAccel: 0.005,
	},
	clouds: {
		cloudsRadius: 6379,
		cloudsRotationSpeed: 0.00001,
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
		cameraFar: 5000 + 10000 + 20,
	},
	setSelected: () => {},
	updateConfig: () => {},
	resetConfig: () => {},
}

export const useIndexStore = create<State>((set, get) => ({
	...defaultState,
	setSelected: (value: SelectedObject) => set({ selected: value }),
	updateConfig: (partial: Partial<State>) => {
		const current = get()
		set({ ...current, ...partial })
	},
	resetConfig: () => {
		const current = get()
		set({ ...current, ...defaultState })
	},
}))
