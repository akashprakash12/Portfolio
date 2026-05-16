import React, { useRef, useState, Suspense, useCallback, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import Plane from "./Plane";
import CinematicCamera from "./CinematicCamera";
import { useSceneControls } from "../modules/scene/useSceneControls";
import { SceneShadows } from "../modules/scene/SceneShadows";
import SceneModelRig from "../modules/scene/SceneModelRig";
import SceneViewport from "../modules/scene/SceneViewport";
import CinematicLighting from "../modules/scene/CinematicLighting";
import Mushroom from "../modules/scene/Mushroom";

const Scene = ({ activeSection = 0 }) => {
  const [shadowKey, setShadowKey] = useState(0);
  const cursorRef = useRef(new THREE.Vector3());

  // Camera positions for each section (memoized)
  const cameraPositions = useMemo(() => [
    [0, 0, 6],                              // Home
    [-5.900000000000002, 0, 6],             // About
    [3, 1, 7],                              // Skills
    [-2, 1, 8],                             // Projects
    [4, 0.5, 6],                            // Contact
  ], []);

  const targetCamPos = cameraPositions[activeSection] || cameraPositions[0];
  const {
    position,
    rotation,
    scale,
    triangleGap,
    scatterIntensity,
    touchRadius,
    keyPosition,
    keyIntensity,
    keyColor,
    fillPosition,
    fillIntensity,
    fillColor,
    fillDistance,
    // Bloom
    bloomIntensity,
    luminanceThreshold,
    luminanceSmoothing,
    // Window rays
    windowColor,
    windowRayCount,
    windowRayOpacity,
    windowRayLength,
    mushroomPosition,
    mushroomRotation,
    mushroomScale,
  } = useSceneControls();

  // Trigger shadow refresh when dragging (memoized)
  const handleDrag = useCallback(() => {
    setShadowKey((prev) => prev + 1);
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 6], fov: 53, near: 0.01, far: 100 }}
      onCreated={({ gl }) => {
        // enable softer PCF shadows to reduce banding/zebra artifacts
        gl.shadowMap.enabled = true
        gl.shadowMap.type = THREE.PCFSoftShadowMap
      }}
    >
      <color attach="background" args={["#050816"]} />
      <fog attach="fog" args={["#050816", 2, 10]} />

      <CinematicLighting
        keyPosition={keyPosition}
        keyIntensity={keyIntensity}
        keyColor={keyColor}
        fillPosition={fillPosition}
        fillIntensity={fillIntensity}
        fillColor={fillColor}
        fillDistance={fillDistance}
      />
      <CinematicCamera targetCamPos={targetCamPos} activeSection={activeSection} />
      <Plane />

      {/* Soft shadow layer, refreshed when the model is dragged. */}
      <SceneShadows shadowKey={shadowKey} />

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
        windowColor={windowColor}
        windowRayCount={windowRayCount}
        windowRayOpacity={windowRayOpacity}
        windowRayLength={windowRayLength}
      />

      {/* Mushroom model on the left side (always rendered, hidden when not needed) */}
      <Suspense fallback={null}>
        <Mushroom
          position={mushroomPosition}
          rotation={mushroomRotation}
          scale={mushroomScale}
          visible={activeSection >= 1}
        />
      </Suspense>

      {/* Viewport polish: orbit limits, environment light, bloom, and axis helper. */}
      <SceneViewport
        bloomIntensity={bloomIntensity}
        luminanceThreshold={luminanceThreshold}
        luminanceSmoothing={luminanceSmoothing}
      />
    </Canvas>
  );
};

export default React.memo(Scene, (prevProps, nextProps) => {
  return prevProps.activeSection === nextProps.activeSection;
});
