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
	const sceneRef = useRef<ThreeScene | null>(null)
	const worldRef = useRef<Object3D | null>(null)
	const sunRef = useRef<DirectionalLight | null>(null)
	const cameraRef = useRef<PerspectiveCamera | null>(null)
	const rendererRef = useRef<WebGLRenderer | null>(null)

	const isDraggingRef = useRef(false)
	const yawRef = useRef(0)
	const pitchRef = useRef(0)
	const inertiaRef = useRef(new Vector2(0, 0))
	const targetZoomRef = useRef(5)
	const lastMouseMoveRef = useRef(Date.now())
	const lastTouchDistanceRef = useRef(0)

	const {
		selected,
		rotation: { dragSpeedFactor, inertiaDamping },
		zoom: { zoomMin, zoomMax, zoomSpeed },
		cursor: { cursorHideDelay },
		pitch: { pitchMin, pitchMax },
		camera: { cameraFar, cameraFov, cameraNear },
	} = useIndexStore((state) => state)

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

	// add stars once
	useEffect(() => {
		if (stars && world && !world.children.includes(stars)) world.add(stars)
	}, [stars, world])

	// setup camera and renderer
	useEffect(() => {
		const mount = mountRef.current
		if (!mount || !world) return

		const camera = new PerspectiveCamera(cameraFov, mount.clientWidth / mount.clientHeight, cameraNear, cameraFar)
		camera.position.z = 5
		cameraRef.current = camera
		targetZoomRef.current = camera.position.z

		const renderer = new WebGLRenderer({ antialias: true })
		renderer.setSize(mount.clientWidth, mount.clientHeight)
		renderer.outputColorSpace = SRGBColorSpace
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = 2
		mount.appendChild(renderer.domElement)
		rendererRef.current = renderer

		return () => {
			mount.removeChild(renderer.domElement)
		}
	}, [cameraFov, cameraNear, cameraFar, world])

	// handle mouse and touch
	useEffect(() => {
		const mount = mountRef.current
		if (!mount) return

		const startDrag = (x: number, y: number) => {
			isDraggingRef.current = true
			yawRef.current = yawRef.current
			pitchRef.current = pitchRef.current
			inertiaRef.current.set(0, 0)
			lastMouseMoveRef.current = Date.now()
			mount.style.cursor = "grabbing"
			lastTouchDistanceRef.current = 0
			prevXRef.current = x
			prevYRef.current = y
		}

		const moveDrag = (x: number, y: number) => {
			const deltaX = x - prevXRef.current
			const deltaY = y - prevYRef.current
			if (isDraggingRef.current) {
				yawRef.current += deltaX * dragSpeedFactor
				pitchRef.current = MathUtils.clamp(pitchRef.current + deltaY * dragSpeedFactor, pitchMin, pitchMax)
				inertiaRef.current.set(deltaX * dragSpeedFactor, deltaY * dragSpeedFactor)
				prevXRef.current = x
				prevYRef.current = y
			}
			lastMouseMoveRef.current = Date.now()
		}

		const endDrag = () => {
			isDraggingRef.current = false
			mount.style.cursor = "grab"
		}

		const prevXRef = { current: 0 }
		const prevYRef = { current: 0 }

		const handleWheel = (e: WheelEvent) => {
			targetZoomRef.current += e.deltaY * zoomSpeed
			targetZoomRef.current = Math.max(zoomMin, Math.min(zoomMax, targetZoomRef.current))
		}

		const handleMouseMove = (e: MouseEvent) => {
			if (!isDraggingRef.current) mount.style.cursor = "grab"
			moveDrag(e.clientX, e.clientY)
		}

		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY)
			else if (e.touches.length === 2) {
				isDraggingRef.current = false
				const dx = e.touches[0].clientX - e.touches[1].clientX
				const dy = e.touches[0].clientY - e.touches[1].clientY
				lastTouchDistanceRef.current = Math.sqrt(dx * dx + dy * dy)
			}
		}

		const handleTouchMove = (e: TouchEvent) => {
			if (e.touches.length === 1) moveDrag(e.touches[0].clientX, e.touches[0].clientY)
			else if (e.touches.length === 2 && cameraRef.current) {
				const dx = e.touches[0].clientX - e.touches[1].clientX
				const dy = e.touches[0].clientY - e.touches[1].clientY
				const distance = Math.sqrt(dx * dx + dy * dy)
				const delta = lastTouchDistanceRef.current - distance
				targetZoomRef.current += delta * zoomSpeed * 1.5
				targetZoomRef.current = Math.max(zoomMin, Math.min(zoomMax, targetZoomRef.current))
				lastTouchDistanceRef.current = distance
			}
		}

		mount.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY))
		mount.addEventListener("mousemove", handleMouseMove)
		mount.addEventListener("mouseup", endDrag)
		mount.addEventListener("wheel", handleWheel)

		mount.addEventListener("touchstart", handleTouchStart)
		mount.addEventListener("touchmove", handleTouchMove)
		mount.addEventListener("touchend", endDrag)

		return () => {
			mount.removeEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY))
			mount.removeEventListener("mousemove", handleMouseMove)
			mount.removeEventListener("mouseup", endDrag)
			mount.removeEventListener("wheel", handleWheel)

			mount.removeEventListener("touchstart", handleTouchStart)
			mount.removeEventListener("touchmove", handleTouchMove)
			mount.removeEventListener("touchend", endDrag)
		}
	}, [dragSpeedFactor, inertiaDamping, zoomMin, zoomMax, zoomSpeed, pitchMin, pitchMax, cursorHideDelay])

	// handle resize
	useEffect(() => {
		const handleResize = () => {
			if (!mountRef.current || !cameraRef.current || !rendererRef.current) return
			cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
			cameraRef.current.updateProjectionMatrix()
			rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
		}
		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [])

	// animation loop
	useEffect(() => {
		let animationId: number
		const animate = () => {
			animationId = requestAnimationFrame(animate)
			if (!cameraRef.current || !rendererRef.current || !world) return

			// apply inertia if not dragging
			if (!isDraggingRef.current) {
				yawRef.current += inertiaRef.current.x
				pitchRef.current = MathUtils.clamp(pitchRef.current + inertiaRef.current.y, pitchMin, pitchMax)
				inertiaRef.current.multiplyScalar(inertiaDamping)
			}

			world.rotation.x = pitchRef.current
			world.rotation.y = yawRef.current

			// smooth zoom
			cameraRef.current.position.z += (targetZoomRef.current - cameraRef.current.position.z) * 0.03

			// hide cursor if idle
			if (mountRef.current && Date.now() - lastMouseMoveRef.current > cursorHideDelay)
				mountRef.current.style.cursor = "none"

			rendererRef.current.render(scene, cameraRef.current)
		}
		animate()
		return () => cancelAnimationFrame(animationId)
	}, [world, cursorHideDelay, inertiaDamping, pitchMin, pitchMax])

	return (
		<div ref={mountRef} className="h-full w-full cursor-grab touch-none">
			{selected === "moon" ? <Moon world={world} /> : <Earth world={world} />}
			<Debug />
		</div>
	)
}
