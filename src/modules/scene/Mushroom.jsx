import React, { useEffect, useRef, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default React.memo(function Mushroom({ position = [-5, 0, 0], scale = [2, 2, 2], visible = true }) {
  const gltf = useLoader(GLTFLoader, "/models/mushroom.glb");
  const groupRef = useRef();
  const loadedRef = useRef(false);

  // Only clone once
  const clonedScene = useMemo(() => {
    if (gltf.scene && !loadedRef.current) {
      loadedRef.current = true;
      return gltf.scene.clone();
    }
    return null;
  }, [gltf]);

  useEffect(() => {
    if (groupRef.current && clonedScene && !groupRef.current.children.length) {
      groupRef.current.add(clonedScene);
    }
  }, [clonedScene]);

  return (
    <group ref={groupRef} position={position} scale={scale} visible={visible}>
      {/* Mushroom will be loaded into this group */}
    </group>
  );
});
