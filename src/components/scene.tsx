"use client"

import {
	AUTO_ROTATION_ACCEL,
	AUTO_ROTATION_SPEED,
	CURSOR_HIDE_DELAY,
	DRAG_SPEED_FACTOR,
	INERTIA_DAMPING,
} from "@/lib/constants"
import { createSpaceSphere } from "@/lib/objects/galaxy"
import { createLight } from "@/lib/objects/light"
import { createMoon } from "@/lib/objects/moon"
import { createStarfield } from "@/lib/objects/starfield"
import { useEffect, useRef } from "react"
import {
	Object3D,
	PerspectiveCamera,
	Quaternion,
	SRGBColorSpace,
	Scene as ThreeScene,
	Vector2,
	Vector3,
	WebGLRenderer,
} from "three"

export function Scene() {
	const mountRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const mount = mountRef.current
		if (!mount) return

		// scene setup
		const scene = new ThreeScene()
		const camera = new PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 1000)
		const renderer = new WebGLRenderer({ antialias: true })
		renderer.setSize(mount.clientWidth, mount.clientHeight)
		renderer.outputColorSpace = SRGBColorSpace
		mount.appendChild(renderer.domElement)

		// world group
		const world = new Object3D()
		const moon = createMoon()
		const light = createLight({
			position: [5, 2, 5],
			intensity: 70,
		})
		const stars = createStarfield()
		const space = createSpaceSphere()
		world.add(moon, light)
		// world.add(stars)
		world.add(space)
		scene.add(world)

		camera.position.z = 5

		// state
		let isDragging = false
		let prevX = 0
		let prevY = 0
		let inertia = new Vector2(0, 0)
		let moonRotationSpeed = 0
		let lastMouseMove = Date.now()

		// unified drag handling
		const startDrag = (x: number, y: number) => {
			isDragging = true
			prevX = x
			prevY = y
			mount.style.cursor = "grabbing"
			lastMouseMove = Date.now()
		}

		const moveDrag = (x: number, y: number) => {
			const deltaX = x - prevX
			const deltaY = y - prevY

			if (isDragging) {
				const qx = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), deltaX * DRAG_SPEED_FACTOR)
				const qy = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), deltaY * DRAG_SPEED_FACTOR)
				world.quaternion.multiplyQuaternions(qx, world.quaternion)
				world.quaternion.multiplyQuaternions(qy, world.quaternion)

				inertia.set(deltaX * DRAG_SPEED_FACTOR, deltaY * DRAG_SPEED_FACTOR)
				prevX = x
				prevY = y
			}

			mount.style.cursor = isDragging ? "grabbing" : "grab"
			lastMouseMove = Date.now()
		}

		const endDrag = () => {
			isDragging = false
			mount.style.cursor = "grab"
		}

		// mouse events
		const handleMouseDown = (e: MouseEvent) => startDrag(e.clientX, e.clientY)
		const handleMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY)
		const handleMouseUp = () => endDrag()

		// touch events
		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches.length === 1) {
				const touch = e.touches[0]
				startDrag(touch.clientX, touch.clientY)
			}
		}

		const handleTouchMove = (e: TouchEvent) => {
			if (e.touches.length === 1) {
				const touch = e.touches[0]
				moveDrag(touch.clientX, touch.clientY)
			}
		}

		const handleTouchEnd = () => endDrag()

		const handleResize = () => {
			if (!mount) return
			camera.aspect = mount.clientWidth / mount.clientHeight
			camera.updateProjectionMatrix()
			renderer.setSize(mount.clientWidth, mount.clientHeight)
		}

		// listeners
		mount.style.cursor = "grab"
		mount.addEventListener("mousedown", handleMouseDown)
		mount.addEventListener("mousemove", handleMouseMove)
		mount.addEventListener("mouseup", handleMouseUp)
		mount.addEventListener("touchstart", handleTouchStart)
		mount.addEventListener("touchmove", handleTouchMove)
		mount.addEventListener("touchend", handleTouchEnd)
		window.addEventListener("resize", handleResize)

		// animation loop
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

			// --- MOON AUTO-ROTATION ---
			moonRotationSpeed += (AUTO_ROTATION_SPEED - moonRotationSpeed) * AUTO_ROTATION_ACCEL
			const axis = new Vector3(0, 1, 0)
			axis.applyQuaternion(moon.quaternion).normalize()
			const qMoon = new Quaternion().setFromAxisAngle(axis, -moonRotationSpeed)
			moon.quaternion.multiplyQuaternions(qMoon, moon.quaternion)

			// --- Cursor hide ---
			if (now - lastMouseMove > CURSOR_HIDE_DELAY) mount.style.cursor = "none"

			renderer.render(scene, camera)
		}
		animate()

		return () => {
			mount.removeEventListener("mousedown", handleMouseDown)
			mount.removeEventListener("mousemove", handleMouseMove)
			mount.removeEventListener("mouseup", handleMouseUp)
			mount.removeEventListener("touchstart", handleTouchStart)
			mount.removeEventListener("touchmove", handleTouchMove)
			mount.removeEventListener("touchend", handleTouchEnd)
			window.removeEventListener("resize", handleResize)
			mount.removeChild(renderer.domElement)
		}
	}, [])

	return <div ref={mountRef} className="h-full w-full touch-none" />
}
