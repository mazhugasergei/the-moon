"use client"

import { useStarfield } from "@/hooks/use-starfield"
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
import { Debug } from "./debug"
import { Earth } from "./earth"
import { Moon } from "./moon"

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

	const world = new Object3D()
	const stars = useStarfield()

	// Pull all constants from store
	const {
		rotation: { dragSpeedFactor, inertiaDamping },
		zoom: { zoomMin, zoomMax, zoomSpeed },
		cursor: { cursorHideDelay },
		pitch: { pitchMin, pitchMax },
		camera: { cameraFar, cameraFov, cameraNear },
	} = useIndexStore((state) => state)

	useEffect(() => {
		if (stars) world.add(stars)
	}, [stars])

	useEffect(() => {
		const mount = mountRef.current
		if (!mount) return

		// Scene setup
		const scene = new ThreeScene()
		const camera = new PerspectiveCamera(cameraFov, mount.clientWidth / mount.clientHeight, cameraNear, cameraFar)
		camera.position.z = 5

		const renderer = new WebGLRenderer({ antialias: true })
		renderer.setSize(mount.clientWidth, mount.clientHeight)
		renderer.outputColorSpace = SRGBColorSpace
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = 2
		mount.appendChild(renderer.domElement)

		// World container
		const sun = new DirectionalLight(0xffffff, 1.5)
		sun.position.set(10, 10, 10)
		world.add(sun)
		scene.add(world)

		// Interaction & camera logic
		let isDragging = false
		let prevX = 0
		let prevY = 0
		let inertia = new Vector2(0, 0)
		let yaw = 0
		let pitch = 0
		let targetZoom = camera.position.z
		let lastMouseMove = Date.now()

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
				yaw += deltaX * dragSpeedFactor
				pitch += deltaY * dragSpeedFactor
				pitch = MathUtils.clamp(pitch, pitchMin, pitchMax)
				inertia.set(deltaX * dragSpeedFactor, deltaY * dragSpeedFactor)
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

		const handleWheel = (e: WheelEvent) => {
			targetZoom += e.deltaY * zoomSpeed
			targetZoom = Math.max(zoomMin, Math.min(zoomMax, targetZoom))
		}
		mount.addEventListener("wheel", handleWheel)

		const handleResize = () => {
			camera.aspect = mount.clientWidth / mount.clientHeight
			camera.updateProjectionMatrix()
			renderer.setSize(mount.clientWidth, mount.clientHeight)
		}
		window.addEventListener("resize", handleResize)

		const animate = () => {
			requestAnimationFrame(animate)

			// world rotation & inertia
			if (!isDragging) {
				yaw += inertia.x
				pitch += inertia.y
				pitch = MathUtils.clamp(pitch, pitchMin, pitchMax)
				inertia.multiplyScalar(inertiaDamping)
			}

			world.rotation.x = pitch
			world.rotation.y = yaw
			camera.position.z += (targetZoom - camera.position.z) * 0.03

			if (Date.now() - lastMouseMove > cursorHideDelay) mount.style.cursor = "none"

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
	}, [
		selected,
		stars,
		dragSpeedFactor,
		inertiaDamping,
		zoomMin,
		zoomMax,
		zoomSpeed,
		cursorHideDelay,
		pitchMin,
		pitchMax,
		cameraFov,
		cameraNear,
		cameraFar,
	])

	return (
		<div ref={mountRef} className="h-full w-full touch-none">
			{selected === "moon" ? <Moon world={world} /> : <Earth world={world} />}
			<Debug />
		</div>
	)
}
