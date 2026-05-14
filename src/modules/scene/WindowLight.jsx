import React, { useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

// Finds the `windows` group in the scene, makes its material emissive, and
// attaches a point light so bloom and lighting work without editing the GLTF.
export default function WindowLight({ color = '#2f80ff', intensity = 2, distance = 8 }) {
  const { scene } = useThree()

  useEffect(() => {
    if (!scene) return

    const windowsGroup = scene.getObjectByName('windows')
    if (!windowsGroup) return

    // Make any mesh materials under the windows group emissive
    windowsGroup.traverse((child) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((mat) => {
          if (!mat) return
          mat.emissive = new THREE.Color(color)
          mat.emissiveIntensity = intensity
          mat.needsUpdate = true
        })
      }
    })

    // Add a single point light (only once)
    if (!windowsGroup.userData._windowLightAdded) {
      const light = new THREE.PointLight(color, intensity, distance, 2)
      light.castShadow = true
      // place light at the group's local origin so it follows any model transforms
      light.position.set(0, 0, 0)
      windowsGroup.add(light)
      windowsGroup.userData._windowLightAdded = true
    }

    return () => {
      // optional cleanup: remove the light if it was added
      if (windowsGroup && windowsGroup.userData._windowLightAdded) {
        const added = windowsGroup.children.find((c) => c.isLight)
        if (added) windowsGroup.remove(added)
        windowsGroup.userData._windowLightAdded = false
      }
    }
  }, [scene, color, intensity, distance])

  return null
}
