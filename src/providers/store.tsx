"use client"

import { useIndexStore } from "@/stores"
import { createContext, useContext } from "react"
import { StoreApi, useStore } from "zustand"

type IndexStore = typeof useIndexStore

const IndexStoreContext = createContext<IndexStore | null>(null)

export function StoreProvider({ children, store = useIndexStore }: { children: React.ReactNode; store?: IndexStore }) {
	return <IndexStoreContext.Provider value={store}>{children}</IndexStoreContext.Provider>
}

export function useIndexStoreContext<T>(selector: (state: IndexStore extends StoreApi<infer S> ? S : never) => T): T {
	const store = useContext(IndexStoreContext)
	if (!store) {
		throw new Error("useIndexStoreContext must be used within a IndexStoreProvider")
	}
	return useStore(store, selector)
}
