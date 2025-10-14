"use client"

import {
	CAMERA_FAR,
	CAMERA_FOV,
	CAMERA_NEAR,
	CLOUDS_ROTATION_ACCEL,
	CLOUDS_ROTATION_SPEED,
	CURSOR_HIDE_DELAY,
	DRAG_SPEED_FACTOR,
	EARTH_ROTATION_ACCEL,
	EARTH_ROTATION_SPEED,
	INERTIA_DAMPING,
	MOON_DISTANCE,
	MOON_ORBIT_SPEED,
	MOON_ROTATION_ACCEL,
	MOON_ROTATION_SPEED,
	PITCH_MAX,
	PITCH_MIN,
	ZOOM_MAX,
	ZOOM_MIN,
	ZOOM_SPEED,
} from "@/lib/constants"
import { createClouds } from "@/lib/objects/clouds"
import { createEarth } from "@/lib/objects/earth"
import { createMoon } from "@/lib/objects/moon"
import { createStarfield } from "@/lib/objects/starfield"
import { StoreProvider } from "@/providers/store"
import { useIndexStore } from "@/stores"
import { useEffect, useRef } from "react"
import {
	DirectionalLight,
	MathUtils,
	Object3D,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene as ThreeScene,
	Vector2,
	WebGLRenderer,
} from "three"

export function Scene() {
	return (
		<StoreProvider>
			<Component />
		</StoreProvider>
	)
}

export function Component() {
	const mountRef = useRef<HTMLDivElement>(null)
	const selected = useIndexStore((state) => state.selected)

	useEffect(() => {
		const mount = mountRef.current
		if (!mount) return

		const scene = new ThreeScene()
		const camera = new PerspectiveCamera(CAMERA_FOV, mount.clientWidth / mount.clientHeight, CAMERA_NEAR, CAMERA_FAR)
		camera.position.z = 5

		const renderer = new WebGLRenderer({ antialias: true })
		renderer.setSize(mount.clientWidth, mount.clientHeight)
		renderer.outputColorSpace = SRGBColorSpace
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = 2 // PCFSoftShadowMap
		mount.appendChild(renderer.domElement)

		const world = new Object3D()
		const sun = new DirectionalLight(0xffffff, 1.5) // white light, intensity ~1–2
		sun.position.set(10, 10, 10) // direction from Sun to scene
		sun.castShadow = false
		// light.castShadow = true

		// if (light.shadow) {
		// 	light.shadow.mapSize.width = 4096
		// 	light.shadow.mapSize.height = 4096
		// 	light.shadow.radius = 4 // soft edge
		// 	const cam = light.shadow.camera as PerspectiveCamera
		// 	cam.near = 0.1
		// 	cam.far = 50
		// 	cam.updateProjectionMatrix()
		// }

		const stars = createStarfield()
		let mainObject: Object3D
		let moonObject: Object3D | null = null
		let moonPivot: Object3D | null = null

		if (selected === "moon") {
			const moon = createMoon({ radiusMultiplier: 3 })
			moon.castShadow = true
			moon.receiveShadow = true
			world.add(sun, stars, moon)
			mainObject = moon
		} else {
			const earth = createEarth()
			earth.castShadow = true
			earth.receiveShadow = true
			const clouds = createClouds()
			earth.add(clouds)

			moonPivot = new Object3D()
			moonPivot.rotation.x = MathUtils.degToRad(5)

			const moon = createMoon({ segments: 64 })
			moon.castShadow = true
			moon.receiveShadow = true
			moon.position.set(MOON_DISTANCE, 0, 0)
			moonPivot.add(moon)

			world.add(sun, stars, earth, moonPivot)

			mainObject = earth
			mainObject.userData = { clouds }
			moonObject = moon
		}

		scene.add(world)

		// --- State ---
		let isDragging = false
		let prevX = 0
		let prevY = 0
		let inertia = new Vector2(0, 0)
		let yaw = 0
		let pitch = 0
		let rotationSpeed = 0
		let cloudsRotationSpeed = 0
		let moonRotationSpeed = 0
		let lastMouseMove = Date.now()
		let targetZoom = camera.position.z
		let pinchStartDist = 0
		let pinchStartZoom = 0

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
				yaw += deltaX * DRAG_SPEED_FACTOR
				pitch += deltaY * DRAG_SPEED_FACTOR
				pitch = MathUtils.clamp(pitch, -Math.PI / 2, Math.PI / 2)
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

		mount.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY))
		mount.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY))
		mount.addEventListener("mouseup", endDrag)

		mount.addEventListener("touchstart", (e) => {
			if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY)
			else if (e.touches.length === 2) {
				const dx = e.touches[0].clientX - e.touches[1].clientX
				const dy = e.touches[0].clientY - e.touches[1].clientY
				pinchStartDist = Math.hypot(dx, dy)
				pinchStartZoom = targetZoom
			}
		})

		mount.addEventListener("touchmove", (e) => {
			if (e.touches.length === 1) moveDrag(e.touches[0].clientX, e.touches[0].clientY)
			else if (e.touches.length === 2) {
				const dx = e.touches[0].clientX - e.touches[1].clientX
				const dy = e.touches[0].clientY - e.touches[1].clientY
				const dist = Math.hypot(dx, dy)
				const zoomDelta = (pinchStartDist - dist) * ZOOM_SPEED * 2.5
				targetZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinchStartZoom + zoomDelta))
			}
		})

		mount.addEventListener("touchend", endDrag)

		const handleWheel = (e: WheelEvent) => {
			targetZoom += e.deltaY * ZOOM_SPEED
			targetZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, targetZoom))
		}
		mount.addEventListener("wheel", handleWheel)

		const handleResize = () => {
			camera.aspect = mount.clientWidth / mount.clientHeight
			camera.updateProjectionMatrix()
			renderer.setSize(mount.clientWidth, mount.clientHeight)
		}
		window.addEventListener("resize", handleResize)

		mount.style.cursor = "grab"

		const animate = () => {
			requestAnimationFrame(animate)
			const now = Date.now()

			// --- Handle inertia ---
			if (!isDragging && inertia.length() > 0.00001) {
				yaw += inertia.x
				pitch += inertia.y
				pitch = MathUtils.clamp(pitch, PITCH_MIN, PITCH_MAX)
				inertia.multiplyScalar(INERTIA_DAMPING)
			}

			// --- Lock world rotation (no roll) ---
			world.rotation.x = MathUtils.clamp(world.rotation.x + inertia.y, PITCH_MIN, PITCH_MAX)
			world.rotation.y += inertia.x

			// --- Rotate main object (Earth or Moon) ---
			const mainRotSpeed = selected === "earth" ? EARTH_ROTATION_SPEED : MOON_ROTATION_SPEED
			const mainRotAccel = selected === "earth" ? EARTH_ROTATION_ACCEL : MOON_ROTATION_ACCEL
			rotationSpeed += (mainRotSpeed - rotationSpeed) * mainRotAccel
			mainObject.rotateY(-rotationSpeed)

			if (selected === "earth" && mainObject.userData.clouds) {
				// --- Rotate clouds ---
				const clouds = mainObject.userData.clouds
				cloudsRotationSpeed += (CLOUDS_ROTATION_SPEED - cloudsRotationSpeed) * CLOUDS_ROTATION_ACCEL
				clouds.rotateY(-cloudsRotationSpeed)

				// --- Moon orbit around Earth ---
				if (moonPivot) moonPivot.rotation.y += MOON_ORBIT_SPEED

				// --- Moon spin on its own axis ---
				if (moonObject) {
					moonRotationSpeed += (MOON_ROTATION_SPEED - moonRotationSpeed) * MOON_ROTATION_ACCEL
					moonObject.rotation.y = -moonRotationSpeed
				}
			}

			// --- Smooth zoom ---
			camera.position.z += (targetZoom - camera.position.z) * 0.03

			// --- Cursor hide ---
			if (now - lastMouseMove > CURSOR_HIDE_DELAY) mount.style.cursor = "none"

			renderer.render(scene, camera)
		}

		animate()

		return () => {
			mount.removeChild(renderer.domElement)
			mount.removeEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY))
			mount.removeEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY))
			mount.removeEventListener("mouseup", endDrag)
			mount.removeEventListener("wheel", handleWheel)
			window.removeEventListener("resize", handleResize)
		}
	}, [selected])

	return <div ref={mountRef} className="h-full w-full touch-none" />
}
