import React, { Suspense } from "react";
import { DragControls } from "@react-three/drei";
import Model from "../../components/Model";
import CursorSphere from "./CursorSphere";
import WindowLight from "./WindowLight";
import WindowRays from "./WindowRays";

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
}) {
  return (
    <>
      <group position={position} rotation={rotation} scale={scale}>
        <DragControls onDrag={onDrag}>
          <Suspense fallback={null}>
            <Model
              triangleGap={triangleGap}
              cursorPosition={cursorRef}
              touchRadius={touchRadius}
              scatterIntensity={scatterIntensity}
            />
          </Suspense>
        </DragControls>
      </group>

      <CursorSphere cursorRef={cursorRef} modelZ={position[2]} />

      {/* Window emission + point light (separate module) */}
      <WindowLight color="#FFFF00" intensity={3} distance={8} />

      {/* Window rays emanating outward */}
      <WindowRays color="#FFFF00" rayCount={3} />
    </>
  );
}