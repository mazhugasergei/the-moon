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
		moonOrbitSpeed: number
	}
	earth: {
		earthRadius: number
		earthRotationSpeed: number
	}
	clouds: {
		cloudsRotationSpeed: number
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
	selected: "earth",
	radiusMultiplier: 0.0005,
	speedMultiplier: 10000,
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
		moonDistanceMultiplier: 0.000008,
		moonDistance: 384400,
		moonRadius: 1737.4,
		moonRotationSpeed: (2 * Math.PI) / 2_359_200,
		moonOrbitSpeed: (2 * Math.PI) / 2_359_200,
	},
	earth: {
		earthRadius: 6378,
		earthRotationSpeed: (2 * Math.PI) / 86_400,
	},
	clouds: {
		cloudsRotationSpeed: 0.000005,
	},
	cursor: {
		cursorHideDelay: 2000,
	},
	zoom: {
		zoomMin: 3,
		zoomMax: 10,
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
		set({
			...defaultState,
			selected: current.selected,
		})
	},
}))
