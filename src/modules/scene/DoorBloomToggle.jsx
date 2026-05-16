import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function DoorBloomToggle({ onToggle }) {
  const { camera, gl, scene } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerDown = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const hits = raycasterRef.current.intersectObjects(scene.children, true);

      for (let i = 0; i < hits.length; i++) {
        let current = hits[i].object;
        while (current) {
          const objectName = (current.name || "").toLowerCase();
          if (
            objectName === "doore" ||
            objectName === "porte001" ||
            objectName.includes("door") ||
            objectName.includes("porte")
          ) {
            onToggle();
            return;
          }
          current = current.parent;
        }
      }
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [camera, gl, onToggle, scene]);

  return null;
}
