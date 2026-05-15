import React, { useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

const WINDOW_GROUP_NAMES = ['vitre', 'vitre001']

// Finds the window groups in the scene, makes their materials emissive, and
// attaches a point light so bloom and lighting work without editing the GLTF.
export default function WindowLight({
  color = '#2f80ff',
  intensity = 2,
  distance = 8,
  rayCount = 1,
  rayOpacity = 0.3,
  rayLength = 6,
}) {
  const { scene } = useThree()
  useEffect(() => {
    if (!scene) return

    const windowsGroups = WINDOW_GROUP_NAMES
      .map((name) => scene.getObjectByName(name))
      .filter(Boolean)

    if (!windowsGroups.length) return

    windowsGroups.forEach((windowsGroup, groupIndex) => {
      // Emissive materials
      windowsGroup.traverse((child) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          mats.forEach((mat) => {
            if (!mat) return
            mat.emissive = new THREE.Color(color)
            mat.emissiveIntensity = intensity * 1.35
            mat.needsUpdate = true
          })
        }
      })

      // Point light
      if (!windowsGroup.userData._windowLightAdded) {
        const light = new THREE.PointLight(color, intensity * 1.4, distance, 2)
        light.castShadow = true
        light.position.set(0, 0, 0)
        light.userData._windowLightSource = true
        windowsGroup.add(light)
        windowsGroup.userData._windowLightAdded = true
      }

      // Rays: one per oval/circular window
      if (!windowsGroup.userData._windowRaysAdded && rayCount > 0) {
        const rayMeshes = []
        for (let i = 0; i < rayCount; i++) {
          const spread = 0.9 + groupIndex * 0.08
          const ray = new THREE.Mesh(
            new THREE.ConeGeometry(0.45, rayLength, 12, 1, true),
            new THREE.MeshBasicMaterial({
              color,
              transparent: true,
              opacity: rayOpacity,
              side: THREE.DoubleSide,
              toneMapped: false,
              depthWrite: false,
            })
          )

          // place slightly in front of window along local Z
          ray.position.set(0, 0, spread + i * 0.05)
          ray.rotation.set(-Math.PI / 2 + 0.2, 0, 0)
          ray.scale.set(1.25 + i * 0.05, 1.6 + i * 0.1, 1.25 + i * 0.05)

          windowsGroup.add(ray)
          rayMeshes.push(ray)
        }

        windowsGroup.userData._windowRays = rayMeshes
        windowsGroup.userData._windowRaysAdded = true
      }
    })

    return () => {
      windowsGroups.forEach((windowsGroup) => {
        if (windowsGroup && windowsGroup.userData._windowLightAdded) {
          windowsGroup.children
            .filter((child) => child.isLight && child.userData?._windowLightSource)
            .forEach((child) => windowsGroup.remove(child))
          windowsGroup.userData._windowLightAdded = false
        }
        if (windowsGroup && windowsGroup.userData._windowRaysAdded) {
          (windowsGroup.userData._windowRays || []).forEach((r) => windowsGroup.remove(r))
          windowsGroup.userData._windowRays = null
          windowsGroup.userData._windowRaysAdded = false
        }
      })
    }
  }, [scene, color, intensity, distance, rayCount, rayOpacity, rayLength])

  return null
}
