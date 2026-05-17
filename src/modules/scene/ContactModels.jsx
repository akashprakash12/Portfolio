import React, { memo, useRef } from "react";
import { useGLTF } from "@react-three/drei";

function ContactModels({
  treePosition = [-5, -1.65, -1.55],
  treeScale = 0.01,
  boyPosition = [-9.4, 2.65, -2.15],
  boyScale = 0.08,
  visible = true,
  ...props
}) {
  const groupRef = useRef();
  const { scene: treeScene } = useGLTF("/models/mushroom_tree.glb");
  const { scene: boyScene } = useGLTF("/models/muhsroom boy.glb");

  const treeScaleVector = typeof treeScale === "number" ? [treeScale, treeScale, treeScale] : treeScale;
  const boyScaleVector = typeof boyScale === "number" ? [boyScale, boyScale, boyScale] : boyScale;

  return (
    <group
      ref={groupRef}
      visible={visible}
      {...props}
    >
      <group position={treePosition} scale={treeScaleVector}>
        <primitive object={treeScene} />
      </group>
      <group position={boyPosition} scale={boyScaleVector}>
        <primitive object={boyScene} />
      </group>
    </group>
  );
}

export default memo(ContactModels);