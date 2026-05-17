import React from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Environment, GizmoHelper, GizmoViewport, OrbitControls } from "@react-three/drei";

// Viewport polish: orbit limits, environment light, bloom, and axis helper.
export default function SceneViewport() {
  return (
    <>
      <OrbitControls enablePan={false} enableZoom={false} />
      {/* <Environment preset="night" /> */}

      <EffectComposer>
        <Bloom intensity={2.6} luminanceThreshold={0.0} luminanceSmoothing={0.18} />
      </EffectComposer>

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport
          axisColors={["#9d4b4b", "#2f7f4f", "#3b5b9d"]}
          labelColor="white"
        />
      </GizmoHelper>
    </>
  );
}