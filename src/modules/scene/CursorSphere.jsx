import React, { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function CursorSphere({ cursorRef, modelZ = 2.5 }) {
  const sphereRef = useRef();
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndcMouse = useRef(new THREE.Vector2(0, 0));
  const tmpPoint = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!sphereRef.current) return;

    // Force camera matrices to be current BEFORE raycasting.
    // The idle sine motion in CinematicCamera mutates camera.position
    // every frame without calling these, so the raycaster was using
    // stale view data — causing the sphere to drift from the cursor.
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    raycaster.setFromCamera(ndcMouse.current, camera);

    let intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects && intersects.length > 0) {
      intersects = intersects.filter((it) => {
        // Skip the cursor sphere itself
        let obj = it.object;
        while (obj) {
          if (obj === sphereRef.current) return false;
          obj = obj.parent;
        }

        // Skip the floor plane (y ≈ -0.85) — it causes the sphere to
        // snap downward when the ray misses the model geometry.
        const worldPos = new THREE.Vector3();
        it.object.getWorldPosition(worldPos);
        if (worldPos.y < -0.5) return false;

        return true;
      });

      if (intersects.length > 0) {
        const p = intersects[0].point;
        sphereRef.current.position.copy(p);
        cursorRef.current.copy(p);
        return;
      }
    }

    // Fallback: project onto a virtual plane at modelZ depth
    const rayOrigin = raycaster.ray.origin;
    const rayDir = raycaster.ray.direction;
    const t = (modelZ - rayOrigin.z) / rayDir.z;
    if (isFinite(t) && t > 0) {
      tmpPoint.copy(rayOrigin).addScaledVector(rayDir, t);
      sphereRef.current.position.copy(tmpPoint);
      cursorRef.current.copy(tmpPoint);
    }
  });

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      ndcMouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ndcMouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [gl]);

  return (
    <mesh ref={sphereRef} renderOrder={10}>
      <sphereGeometry args={[0.06, 24, 24]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#9ad7ff"
        emissiveIntensity={1.2}
      />
    </mesh>
  );
}