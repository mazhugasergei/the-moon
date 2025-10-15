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

	// persistent scene & world
	const sceneRef = useRef<ThreeScene | null>(null)
	const worldRef = useRef<Object3D | null>(null)
	const sunRef = useRef<DirectionalLight | null>(null)

	if (!sceneRef.current) {
		sceneRef.current = new ThreeScene()
		worldRef.current = new Object3D()

		sunRef.current = new DirectionalLight(0xffffff, 1.5)
		sunRef.current.position.set(10, 10, 10)
		worldRef.current.add(sunRef.current)
		sceneRef.current.add(worldRef.current)
	}

	const scene = sceneRef.current
	const world = worldRef.current
	const stars = useStarfield()

	const {
		rotation: { dragSpeedFactor, inertiaDamping },
		zoom: { zoomMin, zoomMax, zoomSpeed },
		cursor: { cursorHideDelay },
		pitch: { pitchMin, pitchMax },
		camera: { cameraFar, cameraFov, cameraNear },
	} = useIndexStore((state) => state)

	useEffect(() => {
		if (stars && world && !world.children.includes(stars)) world.add(stars)
	}, [stars, world])

	useEffect(() => {
		const mount = mountRef.current
		if (!mount || !world) return

		const camera = new PerspectiveCamera(cameraFov, mount.clientWidth / mount.clientHeight, cameraNear, cameraFar)
		camera.position.z = 5

		const renderer = new WebGLRenderer({ antialias: true })
		renderer.setSize(mount.clientWidth, mount.clientHeight)
		renderer.outputColorSpace = SRGBColorSpace
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = 2
		mount.appendChild(renderer.domElement)

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
			lastMouseMove = Date.now()
		}
		const endDrag = () => {
			isDragging = false
			mount.style.cursor = "grab"
		}

		// desktop events
		mount.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY))
		mount.addEventListener("mousemove", (e) => {
			mount.style.cursor = isDragging ? "grabbing" : "grab"
			moveDrag(e.clientX, e.clientY)
		})
		mount.addEventListener("mouseup", endDrag)
		mount.addEventListener("wheel", (e) => {
			targetZoom += e.deltaY * zoomSpeed
			targetZoom = Math.max(zoomMin, Math.min(zoomMax, targetZoom))
		})

		// touch (mobile)
		let lastTouchDistance = 0
		mount.addEventListener("touchstart", (e) => {
			if (e.touches.length === 1) {
				startDrag(e.touches[0].clientX, e.touches[0].clientY)
			} else if (e.touches.length === 2) {
				isDragging = false
				const dx = e.touches[0].clientX - e.touches[1].clientX
				const dy = e.touches[0].clientY - e.touches[1].clientY
				lastTouchDistance = Math.sqrt(dx * dx + dy * dy)
			}
		})
		mount.addEventListener("touchmove", (e) => {
			if (e.touches.length === 1) {
				moveDrag(e.touches[0].clientX, e.touches[0].clientY)
			} else if (e.touches.length === 2) {
				const dx = e.touches[0].clientX - e.touches[1].clientX
				const dy = e.touches[0].clientY - e.touches[1].clientY
				const distance = Math.sqrt(dx * dx + dy * dy)
				const delta = lastTouchDistance - distance
				targetZoom += delta * zoomSpeed * 1.5
				targetZoom = Math.max(zoomMin, Math.min(zoomMax, targetZoom))
				lastTouchDistance = distance
			}
		})
		mount.addEventListener("touchend", endDrag)

		const handleResize = () => {
			camera.aspect = mount.clientWidth / mount.clientHeight
			camera.updateProjectionMatrix()
			renderer.setSize(mount.clientWidth, mount.clientHeight)
		}
		window.addEventListener("resize", handleResize)

		const animate = () => {
			requestAnimationFrame(animate)
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
		<div ref={mountRef} className="h-full w-full cursor-grab touch-none">
			{selected === "moon" ? <Moon world={world} /> : <Earth world={world} />}
			<Debug />
		</div>
	)
}
