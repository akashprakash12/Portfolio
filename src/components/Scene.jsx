import React, { useEffect, useRef, useState, Suspense, useCallback, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { AdaptiveDpr, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import Plane from "./Plane";
import CinematicCamera from "./CinematicCamera";
import { useSceneControls } from "../modules/scene/useSceneControls";
import { SceneShadows } from "../modules/scene/SceneShadows";
import SceneModelRig from "../modules/scene/SceneModelRig";
import LoadingMonitor from "../modules/scene/LoadingMonitor";
import CameraParallax from "../modules/scene/CameraParallax";
import SceneViewport from "../modules/scene/SceneViewport";
import CinematicLighting from "../modules/scene/CinematicLighting";
import Mushroom from "../modules/scene/Mushroom";
import Banana from "../modules/scene/Banana";
import ContactModels from "../modules/scene/ContactModels";

const Scene = ({ activeSection = 0, onLoadProgress, onLoaded }) => {
  const [shadowKey, setShadowKey] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [interactionReady, setInteractionReady] = useState(false);
  const cursorRef = useRef(new THREE.Vector3());
  const interactionTimerRef = useRef(null);

  // Camera positions for each section (memoized)
  const cameraPositions = useMemo(
    () => [
      [0, 0, 6], // Home
      [-5.900000000000002, 0, 6], // About
      [-5.9, -0.20000000000000015, -7.0000000000000036], // Skills
      [-2, 1, 8], // Projects
      [4, 0.5, 6], // Contact
    ],
    [],
  );

  // Optional look-at targets per section (so Skills can focus correctly)
  const cameraTargets = useMemo(
    () => [
      [0, 1, 0], // Home
      [0, 1, 0], // About
      [0, 0, 0], // Skills (look at model center)
      [0, 1, 0], // Projects
      [0, 1, 0], // Contact
    ],
    [],
  );

  const targetCamPos = cameraPositions[activeSection] || cameraPositions[0];
  const targetCamLookAt = cameraTargets[activeSection] || cameraTargets[0];
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
    // Helpers
    showLightHelpers,
    // Bloom
    bloomIntensity,
    luminanceThreshold,
    luminanceSmoothing,
    // Window rays
    windowColor,
    windowRayCount,
    windowRayOpacity,
    windowRayLength,
    // Mushroom
    mushroomPosition,
    mushroomScale,
    // Banana
    bananaPosition,
    bananaRotation,
    bananaScale,
    // Contact models
    contactTreePosition,
    contactTreeScale,
    contactBoyPosition,
    contactBoyScale,
  } = useSceneControls();

  // Trigger shadow refresh when dragging (memoized)
  const handleDrag = useCallback(() => {
    setShadowKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!assetsLoaded) {
      setInteractionReady(false);
      return undefined;
    }

    interactionTimerRef.current = window.setTimeout(() => {
      setInteractionReady(true);
      if (typeof onLoaded === "function") onLoaded();
    }, 650);

    return () => {
      if (interactionTimerRef.current) {
        window.clearTimeout(interactionTimerRef.current);
      }
    };
  }, [assetsLoaded]);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 6], fov: 53, near: 0.01, far: 100 }}
      onCreated={({ gl }) => {
        // enable softer PCF shadows to reduce banding/zebra artifacts
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        // Ensure the canvas handles touch/pointer input directly on mobile so
        // interactions (orbit/drag) don't get intercepted by the overlay UI.
        // Also disable browser touch-action so three's controls receive events.
        try {
          gl.domElement.style.touchAction = "none";
          gl.domElement.style.pointerEvents = "auto";

          const stop = (e) => {
            e.stopPropagation();
          };

          gl.domElement.addEventListener("pointerdown", stop, { passive: false });
          gl.domElement.addEventListener("pointermove", stop, { passive: false });
          gl.domElement.addEventListener("pointerup", stop, { passive: false });
          gl.domElement.addEventListener("touchstart", stop, { passive: false });
          gl.domElement.addEventListener("touchmove", stop, { passive: false });
          gl.domElement.addEventListener("touchend", stop, { passive: false });
        } catch (err) {
          // ignore if DOM not available or styles can't be applied
        }
      }}
    >
      <AdaptiveDpr pixelated={false} />
      <color attach="background" args={["#050816"]} />
      <fog attach="fog" args={["#050816", 2, 10]} />

      <CinematicLighting
        showLightHelpers={showLightHelpers}
        keyPosition={keyPosition}
        keyIntensity={keyIntensity}
        keyColor={keyColor}
        fillPosition={fillPosition}
        fillIntensity={fillIntensity}
        fillColor={fillColor}
        fillDistance={fillDistance}
      />
      <CinematicCamera
        targetCamPos={targetCamPos}
        targetCamLookAt={targetCamLookAt}
        activeSection={activeSection}
      />
      <CameraParallax
        basePosition={targetCamPos}
        baseLookAt={targetCamLookAt}
        // Disable parallax for Contact and Skills so Leva / CinematicCamera
        // can fully control those section-specific camera positions.
        enabled={interactionReady && activeSection !== 4 && activeSection !== 2}
        intensity={0.16}
        verticalIntensity={0.11}
        damping={4.2}
      />
      <Plane />

      {/* Soft shadow layer, refreshed when the model is dragged. */}
      {/* <SceneShadows shadowKey={shadowKey} /> */}

      {/* Draggable model and the visible cursor sphere. */}
      <Suspense fallback={null}>
        <LoadingMonitor
          onProgress={(p) => {
            if (typeof onLoadProgress === "function") onLoadProgress(p);
          }}
          onLoaded={() => {
            setAssetsLoaded(true);
          }}
        />
      </Suspense>
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
        interactionReady={interactionReady}
      />

      <ContactShadows
        position={[0, -1.75, 0]}
        opacity={0.38}
        scale={14}
        blur={2.8}
        far={4.5}
        resolution={1024}
        color="#000000"
      />

      {/* Mushroom model on the left side (always rendered, hidden when not needed) */}
      <Suspense fallback={null}>
        <Mushroom
          position={mushroomPosition}
          scale={mushroomScale}
          visible={activeSection >= 1}
        />
      </Suspense>

      {/* Banana model for the Skills section */}
      <Suspense fallback={null}>
        <Banana
          position={bananaPosition}
          rotation={bananaRotation}
          scale={bananaScale}
          visible={activeSection === 2}
        />
      </Suspense>

      {/* Contact models for the Contact section */}
      <Suspense fallback={null}>
        <ContactModels
          treePosition={contactTreePosition}
          treeScale={contactTreeScale}
          boyPosition={contactBoyPosition}
          boyScale={contactBoyScale}
          visible={activeSection === 4}
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
