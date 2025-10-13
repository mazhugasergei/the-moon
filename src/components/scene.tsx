"use client"

import {
	AUTO_ROTATION_ACCEL,
	AUTO_ROTATION_SPEED,
	CAMERA_FAR,
	CAMERA_FOV,
	CAMERA_NEAR,
	CURSOR_HIDE_DELAY,
	DRAG_SPEED_FACTOR,
	INERTIA_DAMPING,
	ZOOM_MAX,
	ZOOM_MIN,
	ZOOM_SPEED,
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

		// --- Scene & camera ---
		const scene = new ThreeScene()
		const camera = new PerspectiveCamera(CAMERA_FOV, mount.clientWidth / mount.clientHeight, CAMERA_NEAR, CAMERA_FAR)
		camera.position.z = 5
		const renderer = new WebGLRenderer({ antialias: true })
		renderer.setSize(mount.clientWidth, mount.clientHeight)
		renderer.outputColorSpace = SRGBColorSpace
		mount.appendChild(renderer.domElement)

		// --- World ---
		const world = new Object3D()
		const moon = createMoon()
		const light = createLight({ position: [5, 2, 5], intensity: 70 })
		const stars = createStarfield()
		const space = createSpaceSphere()
		world.add(moon, light, stars)
		scene.add(world)

		// --- State ---
		let isDragging = false
		let prevX = 0
		let prevY = 0
		let inertia = new Vector2(0, 0)
		let moonRotationSpeed = 0
		let lastMouseMove = Date.now()
		let targetZoom = camera.position.z
		let pinchStartDist = 0
		let pinchStartZoom = 0

		// --- Drag handlers ---
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

		// --- Mouse events ---
		mount.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY))
		mount.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY))
		mount.addEventListener("mouseup", endDrag)

		// --- Touch events ---
		mount.addEventListener("touchstart", (e) => {
			if (e.touches.length === 1) {
				const touch = e.touches[0]
				startDrag(touch.clientX, touch.clientY)
			} else if (e.touches.length === 2) {
				const dx = e.touches[0].clientX - e.touches[1].clientX
				const dy = e.touches[0].clientY - e.touches[1].clientY
				pinchStartDist = Math.hypot(dx, dy)
				pinchStartZoom = targetZoom
			}
		})

		mount.addEventListener("touchmove", (e) => {
			if (e.touches.length === 1) {
				const touch = e.touches[0]
				moveDrag(touch.clientX, touch.clientY)
			} else if (e.touches.length === 2) {
				const dx = e.touches[0].clientX - e.touches[1].clientX
				const dy = e.touches[0].clientY - e.touches[1].clientY
				const dist = Math.hypot(dx, dy)
				const zoomDelta = (pinchStartDist - dist) * ZOOM_SPEED * 2.5
				targetZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinchStartZoom + zoomDelta))
			}
		})

		mount.addEventListener("touchend", endDrag)

		// --- Scroll zoom ---
		const handleWheel = (e: WheelEvent) => {
			targetZoom += e.deltaY * ZOOM_SPEED
			targetZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, targetZoom))
		}
		mount.addEventListener("wheel", handleWheel)

		// --- Resize ---
		const handleResize = () => {
			camera.aspect = mount.clientWidth / mount.clientHeight
			camera.updateProjectionMatrix()
			renderer.setSize(mount.clientWidth, mount.clientHeight)
		}
		window.addEventListener("resize", handleResize)

		mount.style.cursor = "grab"

		// --- Animation loop ---
		const animate = () => {
			requestAnimationFrame(animate)
			const now = Date.now()

			if (!isDragging && inertia.length() > 0.00001) {
				const qx = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), inertia.x)
				const qy = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), inertia.y)
				world.quaternion.multiplyQuaternions(qx, world.quaternion)
				world.quaternion.multiplyQuaternions(qy, world.quaternion)
				inertia.multiplyScalar(INERTIA_DAMPING)
			}

			moonRotationSpeed += (AUTO_ROTATION_SPEED - moonRotationSpeed) * AUTO_ROTATION_ACCEL
			const axis = new Vector3(0, 1, 0)
			axis.applyQuaternion(moon.quaternion).normalize()
			const qMoon = new Quaternion().setFromAxisAngle(axis, -moonRotationSpeed)
			moon.quaternion.multiplyQuaternions(qMoon, moon.quaternion)

			camera.position.z += (targetZoom - camera.position.z) * 0.03

			if (now - lastMouseMove > CURSOR_HIDE_DELAY) mount.style.cursor = "none"

			renderer.render(scene, camera)
		}
		animate()

		// --- Cleanup ---
		return () => {
			mount.removeChild(renderer.domElement)
			mount.removeEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY))
			mount.removeEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY))
			mount.removeEventListener("mouseup", endDrag)
			mount.removeEventListener("touchstart", () => {})
			mount.removeEventListener("touchmove", () => {})
			mount.removeEventListener("touchend", endDrag)
			mount.removeEventListener("wheel", handleWheel)
			window.removeEventListener("resize", handleResize)
		}
	}, [])

	return <div ref={mountRef} className="h-full w-full touch-none" />
}
