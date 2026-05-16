import React, { memo, useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

function Mushroom({
  position = [-4.900000000000004, -0.5999999999999999, 2.1999999999999997],
  rotation = [-0.010000000000000004, 0, 0],
  scale = 2.3,
  visible = true,
  ...props
}) {
  const group = useRef();
  const { scene, animations } = useGLTF("/models/mushroom.glb");
  const { actions } = useAnimations(animations, group);
  const wrapperRef = useRef();

  useEffect(() => {
    if (!actions || !Object.keys(actions).length) return undefined;

    const startedActions = Object.values(actions)
      .filter(Boolean)
      .map((action) => {
        action.reset().fadeIn(0.2).play();
        action.paused = false;
        return action;
      });

    return () => {
      startedActions.forEach((action) => action.fadeOut(0.2));
    };
  }, [actions]);

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale} visible={visible} {...props}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/mushroom.glb");

export default memo(Mushroom);
