import React, { memo, Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  AccumulativeShadows,
  Center,
  DragControls,
  Environment,
  GizmoHelper,
  GizmoViewport,
  Grid,
  RandomizedLight,
} from "@react-three/drei";
import { OrbitControls } from "@react-three/drei";
import Plane from "./Plane";
import Model from "./Model";
import CinematicCamera from "./CinematicCamera";
import Lights from "./Lights";

const Scene = () => {
  const [shadowKey, setShadowKey] = useState(0);

  // Trigger shadow refresh when dragging
  const handleDrag = () => {
    setShadowKey((prev) => prev + 1);
  };

  return (
    <Canvas shadows camera={{ position: [-15, 10, 12], fov: 12 }}>
<color attach="background" args={[0x000000]} />
<fog attach="fog" args={[0x000000, 10, 40]} />


    <Lights></Lights>
      <CinematicCamera />
      <Plane />

      {/* --- Soft Dynamic Shadows --- */}
      <Shadows shadowKey={shadowKey} />

      {/* --- Draggable Sphere --- */}
      <Center top position={[-2, 0, 2]}>
        <DragControls onDrag={handleDrag}>
          <Suspense fallback={null}>
            <Model ></Model>
          </Suspense>
        </DragControls>
      </Center>

      {/* --- Grid Floor --- */}
      <Grid
        gridSize={[10, 10]}
        position={[0, -0.01, 0]}
        infiniteGrid={true}
        cellSize={10}
        cellThickness={2}
        sectionColor="#9d4b4b"
        sectionSize={3}
        sectionThickness={1.2}
        side={2}
        fadeDistance={43}
        followCamera={false}
        cellColor="#6f6f6f"
      />

      <OrbitControls makeDefault />
      <Environment preset="sunset" />

    {/* {/* <Environment preset="sunset" background={false} environment={false} /> */}


 <color attach="background" args={["#000000"]} />
<fog attach="fog" args={["#000000", 10, 40]} />


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
