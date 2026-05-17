import React, { memo, useRef } from "react";
import { useGLTF } from "@react-three/drei";

function Banana({
  position = [-4.2, -0.7, -6],
  rotation = [0, 0, 0],
  scale = 0.005,
  visible = true,
  ...props
}) {
  const groupRef = useRef();
  const { scene } = useGLTF("/models/home-banana.glb");

  const s = typeof scale === "number" ? [scale, scale, scale] : scale;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={s}
      visible={visible}
      {...props}
    >
      <primitive object={scene} />
    </group>
  );
}

export default memo(Banana);
