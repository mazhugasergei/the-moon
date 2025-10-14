import { create } from "zustand"

export type IndexObject = "earth" | "moon"

export interface IndexState {
	selected: IndexObject
	setSelected: (value: IndexObject) => void
}

export const createIndexStore = () => {
	return create<IndexState>((set) => ({
		selected: "moon",
		setSelected: (value: IndexObject) => set({ selected: value }),
	}))
}

export const useIndexStore = createIndexStore()
