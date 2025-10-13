"use client"

import { useEffect, useRef } from "react"
import { Object3D, PerspectiveCamera, Quaternion, Scene as ThreeScene, Vector2, Vector3, WebGLRenderer } from "three"

import { AUTO_ROTATION_ACCEL, AUTO_ROTATION_SPEED, DRAG_SPEED_FACTOR, INERTIA_DAMPING } from "@/lib/constants"
import { createLight } from "@/lib/objects/light"
import { createMoon } from "@/lib/objects/the-moon"

const CURSOR_HIDE_DELAY = 2000 // ms

export function Scene() {
	const mountRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const mount = mountRef.current
		if (!mount) return

		// scene setup
		const scene = new ThreeScene()
		const camera = new PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000)
		const renderer = new WebGLRenderer({ antialias: true })
		renderer.setSize(mount.clientWidth, mount.clientHeight)
		mount.appendChild(renderer.domElement)

		// world group
		const world = new Object3D()
		const moon = createMoon()
		const light = createLight()
		world.add(moon, light)
		scene.add(world)

		camera.position.z = 5

		// state
		let isDragging = false
		let prevX = 0
		let prevY = 0
		let inertia = new Vector2(0, 0)
		let moonRotationSpeed = 0
		let lastMouseMove = Date.now()

		// mouse events
		const handleMouseDown = (e: MouseEvent) => {
			isDragging = true
			prevX = e.clientX
			prevY = e.clientY
			mount.style.cursor = "grabbing"
			lastMouseMove = Date.now()
		}

		const handleMouseMove = (e: MouseEvent) => {
			const deltaX = e.clientX - prevX
			const deltaY = e.clientY - prevY

			if (isDragging) {
				const qx = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), deltaX * DRAG_SPEED_FACTOR)
				const qy = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), deltaY * DRAG_SPEED_FACTOR)
				world.quaternion.multiplyQuaternions(qx, world.quaternion)
				world.quaternion.multiplyQuaternions(qy, world.quaternion)

				inertia.set(deltaX * DRAG_SPEED_FACTOR, deltaY * DRAG_SPEED_FACTOR)

				prevX = e.clientX
				prevY = e.clientY
			}

			// show cursor on move
			mount.style.cursor = isDragging ? "grabbing" : "grab"
			lastMouseMove = Date.now()
			mount.style.opacity = "1"
		}

		const handleMouseUp = () => {
			isDragging = false
			mount.style.cursor = "grab"
		}

		const handleResize = () => {
			if (!mount) return
			camera.aspect = mount.clientWidth / mount.clientHeight
			camera.updateProjectionMatrix()
			renderer.setSize(mount.clientWidth, mount.clientHeight)
		}

		mount.style.cursor = "grab"
		mount.addEventListener("mousedown", handleMouseDown)
		mount.addEventListener("mousemove", handleMouseMove)
		mount.addEventListener("mouseup", handleMouseUp)
		window.addEventListener("resize", handleResize)

		const animate = () => {
			requestAnimationFrame(animate)

			const now = Date.now()

			// --- WORLD ROTATION ---
			if (!isDragging && inertia.length() > 0.00001) {
				const qx = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), inertia.x)
				const qy = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), inertia.y)
				world.quaternion.multiplyQuaternions(qx, world.quaternion)
				world.quaternion.multiplyQuaternions(qy, world.quaternion)
				inertia.multiplyScalar(INERTIA_DAMPING)
			}

			// --- MOON AUTO-ROTATION (always active) ---
			moonRotationSpeed += (AUTO_ROTATION_SPEED - moonRotationSpeed) * AUTO_ROTATION_ACCEL
			const axis = new Vector3(0, 1, 0)
			axis.applyQuaternion(moon.quaternion).normalize()
			const qMoon = new Quaternion().setFromAxisAngle(axis, -moonRotationSpeed)
			moon.quaternion.multiplyQuaternions(qMoon, moon.quaternion)

			// --- Cursor hide ---
			if (now - lastMouseMove > CURSOR_HIDE_DELAY) {
				mount.style.cursor = "none"
			}

			renderer.render(scene, camera)
		}
		animate()

		return () => {
			mount.removeEventListener("mousedown", handleMouseDown)
			mount.removeEventListener("mousemove", handleMouseMove)
			mount.removeEventListener("mouseup", handleMouseUp)
			window.removeEventListener("resize", handleResize)
			mount.removeChild(renderer.domElement)
		}
	}, [])

	return <div ref={mountRef} className="h-full w-full" />
}
