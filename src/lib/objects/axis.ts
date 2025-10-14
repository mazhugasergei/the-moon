"use client"

import { BufferGeometry, Line, LineBasicMaterial, Vector3 } from "three"

interface AxisConfig {
	length?: number
	color?: number
}

export function createAxis({ length = 1, color = 0xffffff }: AxisConfig = {}) {
	const material = new LineBasicMaterial({ color })
	const geometry = new BufferGeometry().setFromPoints([new Vector3(0, -length, 0), new Vector3(0, length, 0)])
	return new Line(geometry, material)
}
