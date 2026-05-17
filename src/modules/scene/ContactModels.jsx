import React, { memo, useRef } from "react";
import { useGLTF } from "@react-three/drei";

function ContactModels({
  position = [-5, -1.15, -1.65],
  rotation = [0.04, -0.34, 0],
  scale = 0.01,
  visible = true,
  ...props
}) {
  const groupRef = useRef();
  const { scene: treeScene } = useGLTF("/models/mushroom_tree.glb");
  const { scene: boyScene } = useGLTF("/models/muhsroom boy.glb");

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
      <group position={[-1.2, 0, 0]}>
        <primitive object={treeScene} />
      </group>
      <group position={[1.2, 0, 0]}>
        <primitive object={boyScene} />
      </group>
    </group>
  );
}

export default memo(ContactModels);