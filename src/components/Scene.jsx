import React, { memo, Suspense, useState } from "react";
import { useControls } from "leva";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import {
  AccumulativeShadows,
  DragControls,
  Environment,
  GizmoHelper,
  GizmoViewport,
  RandomizedLight,
  Float,
} from "@react-three/drei";
import { OrbitControls } from "@react-three/drei";
import Plane from "./Plane";
import Model from "./Model";
import CinematicCamera from "./CinematicCamera";
import Lights from "./Lights";

const Scene = () => {
  const [shadowKey, setShadowKey] = useState(0);

  const { position, rotation, scale } = useControls({
    position: { value: [0.6, -1.15, 2.5], step: 0.1 },
    rotation: { value: [0.05, 0.91, 0], step: 0.01 },
    scale: { value: 3.15, min: 0.1, max: 5 },
  });

  const { timeline } = useControls("Animation", {
    timeline: { value: 0.6, min: 0, max: 1, step: 0.01 },
  });

  const { particleSize, particleSpread, particleSpeed, particleWobble, particleGap } = useControls("Particles", {
    particleSize: { value: 0.03, min: 0.005, max: 0.1, step: 0.005 },
    particleSpread: { value: 0.22, min: 0.01, max: 0.8, step: 0.01 },
    particleSpeed: { value: 0.32, min: 0.05, max: 1.5, step: 0.01 },
    particleWobble: { value: 0.01, min: 0, max: 0.08, step: 0.001 },
    particleGap: { value: 0.08, min: 0, max: 0.3, step: 0.005 },
  });

  // Trigger shadow refresh when dragging
  const handleDrag = () => {
    setShadowKey((prev) => prev + 1);
  };

  return (
    <Canvas shadows camera={{ position: [0, 0, 6], fov: 20 }}>
      <color attach="background" args={["#050816"]} />
      <fog attach="fog" args={["#050816", 8, 20]} />

      <Lights></Lights>
      <CinematicCamera />
      <Plane />

      {/* --- Soft Dynamic Shadows --- */}
      <Shadows shadowKey={shadowKey} />

      {/* --- Draggable + Floating Model (adjust live in Leva) --- */}
      <group position={position} rotation={rotation} scale={scale}>
        <DragControls onDrag={handleDrag}>
          <Suspense fallback={null}>
            <Float
              speed={1.5 + timeline * 1.5}
              rotationIntensity={0.25 + timeline * 0.35}
              floatIntensity={0.7 + timeline * 0.6}
            >
              <Model
                particleSize={particleSize}
                particleSpread={particleSpread}
                particleSpeed={particleSpeed}
                particleWobble={particleWobble}
                particleGap={particleGap}
              />
            </Float>
          </Suspense>
        </DragControls>
      </group>

      <OrbitControls makeDefault />
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
