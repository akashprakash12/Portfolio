import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

export default function WindowRays({ color = "#FFFF00", rayCount = 3 }) {
  const { scene } = useThree();
  const rayRefsRef = useRef([]);

  useEffect(() => {
    if (!scene) return;

    const windowsGroup = scene.getObjectByName("windows");
    if (!windowsGroup) return;

    if (!windowsGroup.userData._windowRaysAdded) {
      const rayMeshes = [];

      // Create multiple rays emanating outward from the window
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2;
        const offsetX = Math.cos(angle) * 0.8;
        const offsetZ = Math.sin(angle) * 0.8;

        const ray = new THREE.Mesh(
          new THREE.ConeGeometry(0.4, 5, 12, 1, true),
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide,
            toneMapped: false,
          })
        );

        ray.position.set(offsetX, 0, offsetZ);
        ray.rotation.set(-Math.PI / 2 + 0.3, angle, 0);
        ray.scale.set(0.8 + i * 0.15, 1 + i * 0.2, 0.8 + i * 0.15);

        windowsGroup.add(ray);
        rayMeshes.push(ray);
      }

      rayRefsRef.current = rayMeshes;
      windowsGroup.userData._windowRaysAdded = true;
    }

    return () => {
      if (windowsGroup && windowsGroup.userData._windowRaysAdded) {
        rayRefsRef.current.forEach((ray) => windowsGroup.remove(ray));
        rayRefsRef.current = [];
        windowsGroup.userData._windowRaysAdded = false;
      }
    };
  }, [scene, color, rayCount]);

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;
    rayRefsRef.current.forEach((ray, index) => {
      if (!ray) return;
      const pulse = 0.6 + Math.sin(elapsed * 2 + index * 0.5) * 0.35;
      ray.scale.z = pulse;
      ray.material.opacity = 0.15 + Math.cos(elapsed * 1.8 + index * 0.6) * 0.15;
    });
  });

  return null;
}
