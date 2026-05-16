import React, { memo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

function Mushroom({
  position = [-4.9, -0.6, 2.2],
  rotation = [0, 0, 0],
  scale = 1.5,
  visible = true,
  ...props
}) {
  const groupRef = useRef();
  const { scene, animations } = useGLTF("/models/mushroom.glb");
  const { actions, names } = useAnimations(animations, groupRef);

  const handlePointerEnter = () => {
    if (names.length === 0) return;
    const action = actions[names[0]];
    if (!action) return;

    action
      .reset()
      .fadeIn(0.2)
      .setLoop(THREE.LoopOnce, 1)   // ✅ play once on hover
      .play();

    action.clampWhenFinished = true; // hold last frame
  };

  const handlePointerLeave = () => {
    if (names.length === 0) return;
    const action = actions[names[0]];
    if (!action) return;

    action.fadeOut(0.3);             // ✅ smoothly rewind/stop on leave
  };

  const s = typeof scale === "number" ? [scale, scale, scale] : scale;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={s}
      visible={visible}
      onPointerEnter={handlePointerEnter}  // ✅ R3F pointer events
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      <primitive object={scene} />
    </group>
  );
}

export default memo(Mushroom);

useGLTF.preload("/models/mushroom.glb");