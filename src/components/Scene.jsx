import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Plane from "./Plane";
import Lights from "./Lights";
import CinematicCamera from "./CinematicCamera";
import { useSceneControls } from "../modules/scene/useSceneControls";
import { SceneShadows } from "../modules/scene/SceneShadows";
import SceneModelRig from "../modules/scene/SceneModelRig";
import SceneViewport from "../modules/scene/SceneViewport";

const Scene = () => {
  const [shadowKey, setShadowKey] = useState(0);
  const cursorRef = useRef(new THREE.Vector3());
  const { position, rotation, scale, triangleGap, scatterIntensity, touchRadius } =
    useSceneControls();

  // Trigger shadow refresh when dragging
  const handleDrag = () => {
    setShadowKey((prev) => prev + 1);
  };

  return (
    <Canvas shadows camera={{ position: [0, 0, 6], fov: 20, near: 0.01, far: 100 }}>
      <color attach="background" args={["#050816"]} />
      <fog attach="fog" args={["#050816", 8, 20]} />

      <Lights />
      <CinematicCamera />
      <Plane />

      {/* Soft shadow layer, refreshed when the model is dragged. */}
      {/* <SceneShadows shadowKey={shadowKey} /> */}

      {/* Draggable model and the visible cursor sphere. */}
      <SceneModelRig
        position={position}
        rotation={rotation}
        scale={scale}
        triangleGap={triangleGap}
        scatterIntensity={scatterIntensity}
        touchRadius={touchRadius}
        cursorRef={cursorRef}
        onDrag={handleDrag}
      />

      {/* Viewport polish: orbit limits, environment light, bloom, and axis helper. */}
      <SceneViewport />
    </Canvas>
  );
};

export default Scene;
