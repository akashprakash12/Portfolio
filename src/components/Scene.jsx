import React, { memo, Suspense, useRef, useState, useEffect, useMemo } from "react";
import { useControls } from "leva";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import {
  AccumulativeShadows,
  DragControls,
  Environment,
  GizmoHelper,
  GizmoViewport,
  RandomizedLight,
} from "@react-three/drei";
import { OrbitControls } from "@react-three/drei";
import Plane from "./Plane";
import Model from "./Model";
import CinematicCamera from "./CinematicCamera";
import Lights from "./Lights";
import CursorSphere from "../modules/scene/CursorSphere";

// CursorSphere moved to modules/scene/CursorSphere.jsx

const Scene = () => {
  const [shadowKey, setShadowKey] = useState(0);
  const [debugDistance, setDebugDistance] = useState(0);
  const cursorRef = useRef(new THREE.Vector3());

  const { position, rotation, scale } = useControls({
    position: { value: [0.6, -1.15, 2.5], step: 0.1 },
    rotation: { value: [0.05, 0.91, 0], step: 0.01 },
    scale: { value: 3.15, min: 0.1, max: 5 },
  });

  const { timeline } = useControls("Animation", {
    timeline: { value: 0.6, min: 0, max: 1, step: 0.01 },
  });

  const { triangleGap } = useControls("Hover Effects", {
    triangleGap: { value: 0.08, min: 0, max: 0.5, step: 0.02 },
  });

  const { touchRadius } = useControls("Cursor Settings", {
    touchRadius: { value: 0.4, min: 0.1, max: 2, step: 0.05 },
  });

  // Trigger shadow refresh when dragging
  const handleDrag = () => {
    setShadowKey((prev) => prev + 1);
  };

  // Update debug distance display
  const modelCenterWorld = new THREE.Vector3(
    position[0],
    position[1],
    position[2]
  );
  const dist = cursorRef.current.distanceTo(modelCenterWorld);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDebugDistance(dist);
    }, 100);
    return () => clearInterval(interval);
  }, [dist]);

  return (
    <>
      <Canvas shadows camera={{ position: [0, 0, 6], fov: 20 }}>
        <color attach="background" args={["#050816"]} />
        <fog attach="fog" args={["#050816", 8, 20]} />

        <Lights></Lights>
        <CinematicCamera />
        <Plane />

        {/* --- Soft Dynamic Shadows --- */}
        <Shadows shadowKey={shadowKey} />

        {/* --- Draggable Model --- */}
        <group position={position} rotation={rotation} scale={scale}>
          <DragControls onDrag={handleDrag}>
            <Suspense fallback={null}>
              <Model triangleGap={triangleGap} cursorPosition={cursorRef} touchRadius={touchRadius} />
            </Suspense>
          </DragControls>
        </group>

        <CursorSphere cursorRef={cursorRef} modelZ={position[2]} />

        <OrbitControls enablePan={false} enableZoom={false} />
        <Environment preset="sunset" />

        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={0.2} />
        </EffectComposer>

      {/* {/* <Environment preset="sunset" background={false} environment={false} /> */}

        {/* --- Axis Helper --- */}
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={["#9d4b4b", "#2f7f4f", "#3b5b9d"]}
            labelColor="white"
          />
        </GizmoHelper>
      </Canvas>
      {/* Debug Distance Display */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        color: '#9ad7ff',
        fontSize: '14px',
        fontFamily: 'monospace',
        pointerEvents: 'none',
        zIndex: 100,
        background: 'rgba(0,0,0,0.6)',
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid rgba(154, 215, 255, 0.3)'
      }}>
        Cursor Distance: {debugDistance.toFixed(2)}
      </div>
    </>
  );
};

/* ========= SHADOW COMPONENT ========= */

const Shadows = memo(({ shadowKey }) => (
  <AccumulativeShadows
    key={shadowKey} // reset shadows when dragged
    temporal
    frames={60}
    color="#9d4b4b"
    colorBlend={0.5}
    alphaTest={0.9}
    scale={20}
  >
    <RandomizedLight amount={8} radius={4} position={[5, 5, -10]} />
  </AccumulativeShadows>
));

export default Scene;
