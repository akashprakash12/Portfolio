import React, { Suspense, useState } from "react";
import { DragControls } from "@react-three/drei";
import Model from "../../components/Model";
import CursorSphere from "./CursorSphere";
import WindowLight from "./WindowLight";
import DoorBloomToggle from "./DoorBloomToggle";
import ChimneySmoke from "./ChimneySmoke";
import DoorLabel from "./DoorLabel";

// Draggable model layer and the cursor sphere that drives triangle scattering.
export default function SceneModelRig({
  position,
  rotation,
  scale,
  triangleGap,
  touchRadius,
  scatterIntensity,
  cursorRef,
  onDrag,
  windowColor,
  windowRayCount,
  windowRayOpacity,
  windowRayLength,
}) {
  const [seedBloomEnabled, setSeedBloomEnabled] = useState(false);

  return (
    <>
      <DoorBloomToggle onToggle={() => setSeedBloomEnabled((current) => !current)} />

      <group position={position} rotation={rotation} scale={scale}>
        <DragControls onDrag={onDrag}>
          <Suspense fallback={null}>
            <Model
              triangleGap={triangleGap}
              cursorPosition={cursorRef}
              touchRadius={touchRadius}
              scatterIntensity={scatterIntensity}
              seedBloomEnabled={seedBloomEnabled}
            />
            <DoorLabel />
            <ChimneySmoke />
          </Suspense>
        </DragControls>
      </group>

      {/* <CursorSphere cursorRef={cursorRef} modelZ={position[2]} /> */}

      {/* Window emission + point light + rays (merged) */}
      <WindowLight
        color={windowColor}
        intensity={3}
        distance={8}
        rayCount={windowRayCount}
        rayOpacity={windowRayOpacity}
        rayLength={windowRayLength}
      />
    </>
  );
}