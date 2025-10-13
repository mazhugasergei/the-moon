"use client"

import ldem_3_8bit from "@/assets/images/ldem_3_8bit.jpg"
import lroc_color_poles_1k from "@/assets/images/lroc_color_poles_1k.jpg"
import { useEffect, useRef } from "react"
import * as THREE from "three"

export function Scene() {
	const mountRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const mount = mountRef.current
		if (!mount) return

		// constants
		const AUTO_ROTATION_SPEED = -0.002 // negative = counterclockwise
		const AUTO_ROTATION_ACCEL = 0.002
		const INERTIA_DAMPING = 0.95
		const DRAG_SPEED_FACTOR = 0.005
		const IDLE_DELAY = 2000

		// scene setup
		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000)
		const renderer = new THREE.WebGLRenderer({ antialias: true })
		renderer.setSize(mount.clientWidth, mount.clientHeight)
		mount.appendChild(renderer.domElement)

		// textures
		const loader = new THREE.TextureLoader()
		const colorTexture = loader.load(lroc_color_poles_1k.src)
		const bumpTexture = loader.load(ldem_3_8bit.src)

		// sphere
		const geometry = new THREE.SphereGeometry(1.5, 64, 64)
		const material = new THREE.MeshStandardMaterial({
			map: colorTexture,
			bumpMap: bumpTexture,
			bumpScale: 0.05,
			roughness: 0.7,
			metalness: 0.0,
		})
		const sphere = new THREE.Mesh(geometry, material)
		scene.add(sphere)

		// rotation axis line along sphere's local Y
		// const axisMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
		// const axisGeometry = new THREE.BufferGeometry().setFromPoints([
		// 	new THREE.Vector3(0, -2, 0),
		// 	new THREE.Vector3(0, 2, 0),
		// ])
		// const rotationAxis = new THREE.Line(axisGeometry, axisMaterial)
		// sphere.add(rotationAxis)

		// lights
		const light = new THREE.PointLight(0xffffff, 70)
		light.position.set(5, 2, 5)
		scene.add(light)
		const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
		scene.add(ambientLight)

		camera.position.z = 5

		// state
		let isDragging = false
		let prevX = 0
		let prevY = 0
		let lastInteraction = 0
		let inertia = new THREE.Vector2(0, 0)
		let rotationSpeed = 0

		// mouse events
		const handleMouseDown = (e: MouseEvent) => {
			isDragging = true
			prevX = e.clientX
			prevY = e.clientY
			mount.style.cursor = "grabbing"
		}

		const handleMouseMove = (e: MouseEvent) => {
			if (!isDragging) return
			const deltaX = e.clientX - prevX
			const deltaY = e.clientY - prevY

			const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * DRAG_SPEED_FACTOR)
			const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * DRAG_SPEED_FACTOR)
			sphere.quaternion.multiplyQuaternions(qx, sphere.quaternion)
			sphere.quaternion.multiplyQuaternions(qy, sphere.quaternion)

			inertia.set(deltaX * DRAG_SPEED_FACTOR, deltaY * DRAG_SPEED_FACTOR)

			prevX = e.clientX
			prevY = e.clientY
			lastInteraction = Date.now()
		}

		const handleMouseUp = () => {
			isDragging = false
			mount.style.cursor = "grab"
			lastInteraction = Date.now()
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

			if (!isDragging) {
				// inertia
				if (inertia.length() > 0.00001) {
					const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), inertia.x)
					const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), inertia.y)
					sphere.quaternion.multiplyQuaternions(qx, sphere.quaternion)
					sphere.quaternion.multiplyQuaternions(qy, sphere.quaternion)
					inertia.multiplyScalar(INERTIA_DAMPING)
				}

				// smooth auto-rotation speed up
				if (now - lastInteraction > IDLE_DELAY) {
					rotationSpeed += (AUTO_ROTATION_SPEED - rotationSpeed) * AUTO_ROTATION_ACCEL
				} else {
					rotationSpeed = 0
				}

				// rotate around sphere's current Y axis, invert rotation to match constant sign
				const axis = new THREE.Vector3(0, 1, 0)
				axis.applyQuaternion(sphere.quaternion).normalize()
				const qAuto = new THREE.Quaternion().setFromAxisAngle(axis, -rotationSpeed) // <-- invert here
				sphere.quaternion.multiplyQuaternions(qAuto, sphere.quaternion)
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
