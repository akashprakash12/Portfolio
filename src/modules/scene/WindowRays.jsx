import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

const WINDOW_GROUP_NAMES = ["vitre", "vitre001"];

export default function WindowRays({ color = "#FFFF00", rayCount = 3, baseOpacity = 0.3, baseLength = 6 }) {
  const { scene } = useThree();
  const rayRefsRef = useRef([]);

  useEffect(() => {
    if (!scene) return;

    const windowGroups = WINDOW_GROUP_NAMES
      .map((name) => scene.getObjectByName(name))
      .filter(Boolean);

    if (!windowGroups.length) return;

    const rayMeshes = [];

    windowGroups.forEach((windowsGroup, groupIndex) => {
      if (windowsGroup.userData._windowRaysAdded) return;

      // For oval/circular windows we emit a single wider ray outward
      const spread = 0.9 + groupIndex * 0.08;
      const ray = new THREE.Mesh(
        new THREE.ConeGeometry(0.45, baseLength, 12, 1, true),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: baseOpacity,
          side: THREE.DoubleSide,
          toneMapped: false,
          depthWrite: false,
        })
      );

      // Place the single ray in front of the window group along its local Z
      ray.position.set(0, 0, spread);
      ray.rotation.set(-Math.PI / 2 + 0.2, 0, 0);
      ray.scale.set(1.25, 1.6, 1.25);

      windowsGroup.add(ray);
      rayMeshes.push(ray);

      windowsGroup.userData._windowRaysAdded = true;
    });

    rayRefsRef.current = rayMeshes;

    return () => {
      windowGroups.forEach((windowsGroup) => {
        if (windowsGroup && windowsGroup.userData._windowRaysAdded) {
          windowsGroup.children
            .filter((child) => child.isMesh && child.geometry?.type === "ConeGeometry")
            .forEach((child) => windowsGroup.remove(child));
          windowsGroup.userData._windowRaysAdded = false;
        }
      });
      rayRefsRef.current = [];
    };
  }, [scene, color, rayCount]);

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;
    rayRefsRef.current.forEach((ray, index) => {
      if (!ray) return;
      const pulse = 0.7 + Math.sin(elapsed * 2.2 + index * 0.45) * 0.3;
      ray.scale.y = pulse;
      ray.material.opacity = 0.16 + Math.cos(elapsed * 1.8 + index * 0.6) * 0.12;
    });
  });

  return null;
}
