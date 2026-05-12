import React, { memo, Suspense, useEffect, useRef, useState } from "react";
import { useControls } from "leva";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
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

const CursorSphere = ({ cursorRef }) => {
  const sphereRef = useRef();
  const { camera, mouse } = useThree();

  useFrame(() => {
    const targetZ = 0.2;
    const distance = camera.position.z - targetZ;

    sphereRef.current.position.x = mouse.x * distance * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
    sphereRef.current.position.y = mouse.y * distance * Math.tan((camera.fov * Math.PI) / 360);
    sphereRef.current.position.z = targetZ;

    cursorRef.current.copy(sphereRef.current.position);
  });

  return (
    <mesh ref={sphereRef} renderOrder={10}>
      <sphereGeometry args={[0.06, 24, 24]} />
      <meshStandardMaterial color="#ffffff" emissive="#9ad7ff" emissiveIntensity={1.2} />
    </mesh>
  );
};

const Scene = () => {
  const [shadowKey, setShadowKey] = useState(0);
  const cursorRef = useRef(new THREE.Vector3());

  const { position, rotation, scale } = useControls({
    position: { value: [0.6, -1.15, 2.5], step: 0.1 },
    rotation: { value: [0.05, 0.91, 0], step: 0.01 },
    scale: { value: 3.15, min: 0.1, max: 5 },
  });

  const { timeline } = useControls("Animation", {
    timeline: { value: 0.6, min: 0, max: 1, step: 0.01 },
  });

  const { separationDistance, triangleGap } = useControls("Hover Effects", {
    separationDistance: { value: 0.4, min: 0.1, max: 2, step: 0.1 },
    triangleGap: { value: 0.08, min: 0, max: 0.5, step: 0.02 },
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

      {/* --- Draggable Model --- */}
      <group position={position} rotation={rotation} scale={scale}>
        <DragControls onDrag={handleDrag}>
          <Suspense fallback={null}>
            <Model separationDistance={separationDistance} triangleGap={triangleGap} cursorPosition={cursorRef} />
          </Suspense>
        </DragControls>
      </group>

      <CursorSphere cursorRef={cursorRef} />

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
