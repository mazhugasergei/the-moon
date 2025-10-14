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
} from "@/lib/constants" // all constants controlling camera, rotations, zoom, inertia, etc.
import { createClouds } from "@/lib/objects/clouds"
import { createEarth } from "@/lib/objects/earth"
import { createMoon } from "@/lib/objects/moon"
import { createStarfield } from "@/lib/objects/starfield" // helpers to create objects
import { StoreProvider } from "@/providers/store" // global state provider
import { useIndexStore } from "@/stores" // Zustand store for selected object
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
} from "three" // Three.js core modules

// Root wrapper with store
export function Scene() {
	return (
		<StoreProvider>
			<Component />
		</StoreProvider>
	)
}

// Main 3D scene component
export function Component() {
	const mountRef = useRef<HTMLDivElement>(null) // container div for WebGL canvas
	const selected = useIndexStore((state) => state.selected) // 'earth' or 'moon'

	useEffect(() => {
		const mount = mountRef.current
		if (!mount) return // ensure div exists

		const scene = new ThreeScene() // main scene
		const camera = new PerspectiveCamera(CAMERA_FOV, mount.clientWidth / mount.clientHeight, CAMERA_NEAR, CAMERA_FAR) // perspective camera
		camera.position.z = 5 // initial zoom back

		const renderer = new WebGLRenderer({ antialias: true }) // renderer with smooth edges
		renderer.setSize(mount.clientWidth, mount.clientHeight)
		renderer.outputColorSpace = SRGBColorSpace // correct colors
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = 2 // PCFSoftShadowMap (soft shadows)
		mount.appendChild(renderer.domElement) // add canvas to DOM

		const world = new Object3D() // parent object to rotate entire world
		const sun = new DirectionalLight(0xffffff, 1.5) // directional "sun" light
		sun.position.set(10, 10, 10) // direction of light
		sun.castShadow = false // not casting shadows

		const stars = createStarfield() // static background stars

		// placeholders for main objects
		let mainObject: Object3D
		let moonObject: Object3D | null = null
		let moonPivot: Object3D | null = null

		// Create moon-only scene
		if (selected === "moon") {
			const moon = createMoon({ radiusMultiplier: 3 })
			moon.castShadow = true
			moon.receiveShadow = true
			world.add(sun, stars, moon) // add moon + lighting
			mainObject = moon
		} else {
			// full Earth + Moon scene
			const earth = createEarth()
			earth.castShadow = true
			earth.receiveShadow = true
			const clouds = createClouds()
			earth.add(clouds) // clouds are child of Earth

			moonPivot = new Object3D() // pivot for moon orbit
			moonPivot.rotation.x = MathUtils.degToRad(5) // tilt orbit slightly

			const moon = createMoon({ segments: 64 })
			moon.castShadow = true
			moon.receiveShadow = true
			moon.position.set(MOON_DISTANCE, 0, 0) // place moon at orbit distance
			moonPivot.add(moon)

			world.add(sun, stars, earth, moonPivot) // add everything to world

			mainObject = earth
			mainObject.userData = { clouds } // store clouds reference for rotation
			moonObject = moon
		}

		scene.add(world) // add world container to scene

		// --- Interaction & state ---
		let isDragging = false // true while dragging
		let prevX = 0
		let prevY = 0
		let inertia = new Vector2(0, 0) // stores rotation speed after drag
		let yaw = 0 // horizontal rotation
		let pitch = 0 // vertical rotation
		let rotationSpeed = 0 // Earth's / Moon's spin
		let cloudsRotationSpeed = 0 // cloud rotation
		let moonRotationSpeed = 0 // moon's spin
		let lastMouseMove = Date.now() // track cursor movement for hiding
		let targetZoom = camera.position.z // desired zoom
		let pinchStartDist = 0 // for touch zoom
		let pinchStartZoom = 0

		// --- Drag events ---
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
				yaw += deltaX * DRAG_SPEED_FACTOR // update horizontal rotation
				pitch += deltaY * DRAG_SPEED_FACTOR // update vertical rotation
				pitch = MathUtils.clamp(pitch, -Math.PI / 2, Math.PI / 2) // limit pitch
				inertia.set(deltaX * DRAG_SPEED_FACTOR, deltaY * DRAG_SPEED_FACTOR) // store speed for inertia
				prevX = x
				prevY = y
			}
			mount.style.cursor = isDragging ? "grabbing" : "grab"
			lastMouseMove = Date.now() // reset cursor hide timer
		}

		const endDrag = () => {
			isDragging = false
			mount.style.cursor = "grab"
		}

		mount.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY))
		mount.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY))
		mount.addEventListener("mouseup", endDrag)

		// --- Touch events (drag + pinch zoom) ---
		mount.addEventListener("touchstart", (e) => {
			if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY)
			else if (e.touches.length === 2) {
				// pinch
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
				targetZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinchStartZoom + zoomDelta)) // clamp zoom
			}
		})

		mount.addEventListener("touchend", endDrag)

		// --- Mouse wheel zoom ---
		const handleWheel = (e: WheelEvent) => {
			targetZoom += e.deltaY * ZOOM_SPEED
			targetZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, targetZoom))
		}
		mount.addEventListener("wheel", handleWheel)

		// --- Window resize handler ---
		const handleResize = () => {
			camera.aspect = mount.clientWidth / mount.clientHeight
			camera.updateProjectionMatrix()
			renderer.setSize(mount.clientWidth, mount.clientHeight)
		}
		window.addEventListener("resize", handleResize)

		mount.style.cursor = "grab" // initial cursor

		// --- Main animation loop ---
		const animate = () => {
			requestAnimationFrame(animate)
			const now = Date.now()

			// --- Inertia handling (only when not dragging) ---
			if (!isDragging) {
				yaw += inertia.x
				pitch += inertia.y
				pitch = MathUtils.clamp(pitch, PITCH_MIN, PITCH_MAX)
				inertia.multiplyScalar(INERTIA_DAMPING) // slow down over time
			}

			// --- Apply rotation to world ---
			world.rotation.x = pitch
			world.rotation.y = yaw

			// --- Rotate main object (Earth or Moon) ---
			const mainRotSpeed = selected === "earth" ? EARTH_ROTATION_SPEED : MOON_ROTATION_SPEED
			const mainRotAccel = selected === "earth" ? EARTH_ROTATION_ACCEL : MOON_ROTATION_ACCEL
			rotationSpeed += (mainRotSpeed - rotationSpeed) * mainRotAccel // smooth acceleration
			mainObject.rotateY(-rotationSpeed) // rotate object

			if (selected === "earth" && mainObject.userData.clouds) {
				const clouds = mainObject.userData.clouds
				cloudsRotationSpeed += (CLOUDS_ROTATION_SPEED - cloudsRotationSpeed) * CLOUDS_ROTATION_ACCEL
				clouds.rotateY(-cloudsRotationSpeed) // clouds rotate faster/slower independently

				if (moonPivot) moonPivot.rotation.y += MOON_ORBIT_SPEED // moon orbit

				if (moonObject) {
					// moon spin
					moonRotationSpeed += (MOON_ROTATION_SPEED - moonRotationSpeed) * MOON_ROTATION_ACCEL
					moonObject.rotation.y = -moonRotationSpeed
				}
			}

			// --- Smooth zoom ---
			camera.position.z += (targetZoom - camera.position.z) * 0.03

			// --- Cursor hide after inactivity ---
			if (now - lastMouseMove > CURSOR_HIDE_DELAY) mount.style.cursor = "none"

			renderer.render(scene, camera)
		}

		animate() // start loop

		// --- Cleanup on unmount ---
		return () => {
			mount.removeChild(renderer.domElement)
			mount.removeEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY))
			mount.removeEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY))
			mount.removeEventListener("mouseup", endDrag)
			mount.removeEventListener("wheel", handleWheel)
			window.removeEventListener("resize", handleResize)
		}
	}, [selected])

	return <div ref={mountRef} className="h-full w-full touch-none" /> // container div
}
