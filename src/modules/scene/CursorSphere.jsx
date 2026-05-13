import React, { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function CursorSphere({ cursorRef, modelZ = 2.5 }) {
  const sphereRef = useRef();
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndcMouse = useRef(new THREE.Vector2(0, 0));
  const tmpPoint = useMemo(() => new THREE.Vector3(), []);
  const visualPoint = useMemo(() => new THREE.Vector3(), []);
  const cameraDir = useMemo(() => new THREE.Vector3(), []);
  const planePoint = useMemo(() => new THREE.Vector3(), []);
  const floorPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.85), []);
  const floorLift = useMemo(() => new THREE.Vector3(0, 0.12, 0), []);
  const cameraLift = 0.18;

  useFrame(() => {
    if (!sphereRef.current) return;

    // Force camera matrices to be current BEFORE raycasting.
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

        return true;
      });

      if (intersects.length > 0) {
        const p = intersects[0].point;
        if (intersects[0].object?.geometry?.type === "PlaneGeometry") {
          cursorRef.current.copy(p).add(floorLift);
          camera.getWorldDirection(cameraDir);
          visualPoint.copy(p).add(floorLift).addScaledVector(cameraDir, -cameraLift);
          sphereRef.current.position.copy(visualPoint);
          return;
        }

        cursorRef.current.copy(p);
        camera.getWorldDirection(cameraDir);
        visualPoint.copy(p).addScaledVector(cameraDir, -cameraLift);
        sphereRef.current.position.copy(visualPoint);
        return;
      }
    }

    // If nothing in the scene is hit, project onto the floor plane.
    if (raycaster.ray.intersectPlane(floorPlane, planePoint)) {
      cursorRef.current.copy(planePoint).add(floorLift);
      camera.getWorldDirection(cameraDir);
      visualPoint.copy(planePoint).add(floorLift).addScaledVector(cameraDir, -cameraLift);
      sphereRef.current.position.copy(visualPoint);
      return;
    }

    // Fallback: project onto a virtual plane at modelZ depth
    const rayOrigin = raycaster.ray.origin;
    const rayDir = raycaster.ray.direction;
    const t = (modelZ - rayOrigin.z) / rayDir.z;
    if (isFinite(t) && t > 0) {
      tmpPoint.copy(rayOrigin).addScaledVector(rayDir, t);
      cursorRef.current.copy(tmpPoint);
      camera.getWorldDirection(cameraDir);
      visualPoint.copy(tmpPoint).addScaledVector(cameraDir, -cameraLift);
      sphereRef.current.position.copy(visualPoint);
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
    <mesh ref={sphereRef} renderOrder={999}>
      <sphereGeometry args={[0.06, 24, 24]} />
      {/* depthTest=false ensures the sphere always renders on top of
          every other mesh, including the floor plane and the model */}
      <meshStandardMaterial
        color="#ffffff"
        emissive="#9ad7ff"
        emissiveIntensity={2}
        depthTest={false}
        depthWrite={false}
        transparent={true}
      />
    </mesh>
  );
}