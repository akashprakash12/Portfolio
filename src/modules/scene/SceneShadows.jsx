import React, { memo } from "react";
import { AccumulativeShadows, RandomizedLight } from "@react-three/drei";

// Soft shadow layer that refreshes when the model is dragged.
export const SceneShadows = memo(function SceneShadows({ shadowKey }) {
  return (
    <AccumulativeShadows
      key={shadowKey}
      temporal
      frames={60}
      color="#9d4b4b"
      colorBlend={0.5}
      alphaTest={0.9}
      scale={20}
    >
      <RandomizedLight amount={8} radius={4} position={[5, 5, -10]} />
    </AccumulativeShadows>
  );
});