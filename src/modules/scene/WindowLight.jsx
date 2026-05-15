import React, { useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

const WINDOW_GROUP_NAMES = ['vitre', 'vitre001']

// Finds the window groups in the scene, makes their materials emissive, and
// attaches a point light so bloom and lighting work without editing the GLTF.
export default function WindowLight({ color = '#2f80ff', intensity = 2, distance = 8 }) {
  const { scene } = useThree()

  useEffect(() => {
    if (!scene) return

    const windowsGroups = WINDOW_GROUP_NAMES
      .map((name) => scene.getObjectByName(name))
      .filter(Boolean)

    if (!windowsGroups.length) return

    windowsGroups.forEach((windowsGroup) => {
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

      if (!windowsGroup.userData._windowLightAdded) {
        const light = new THREE.PointLight(color, intensity * 1.4, distance, 2)
        light.castShadow = true
        light.position.set(0, 0, 0)
        light.userData._windowLightSource = true
        windowsGroup.add(light)
        windowsGroup.userData._windowLightAdded = true
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
      })
    }
  }, [scene, color, intensity, distance])

  return null
}
