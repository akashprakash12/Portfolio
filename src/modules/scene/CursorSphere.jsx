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

    raycaster.setFromCamera(ndcMouse.current, camera);

    let intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects && intersects.length > 0) {
      intersects = intersects.filter((it) => {
        let obj = it.object;
        while (obj) {
          if (obj === sphereRef.current) return false;
          obj = obj.parent;
        }
        return true;
      });

      if (intersects.length > 0) {
        const p = intersects[0].point;
        sphereRef.current.position.copy(p);
        cursorRef.current.copy(p);
        return;
      }
    }

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
  const onPointerMove = (event) => {
    ndcMouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;

    ndcMouse.current.y =
      -(event.clientY / window.innerHeight) * 2 + 1;
  };

  window.addEventListener("pointermove", onPointerMove, {
    passive: true,
  });

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
  };
}, []);

  return (
    <mesh ref={sphereRef} renderOrder={10}>
      <sphereGeometry args={[0.06, 24, 24]} />
      <meshStandardMaterial color="#ffffff" emissive="#9ad7ff" emissiveIntensity={1.2} />
    </mesh>
  );
}
