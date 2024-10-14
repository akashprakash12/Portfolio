import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import React, { useRef } from "react";

export default function Camera() {
  const cameraRef = useRef();
  useFrame(() => {
    cameraRef.current.rotation.y += 0.11;
    cameraRef.current.updateMatrixWorld();
   
  });
  const { cmposX, cmposY, cmposZ, scale } = useControls({
    cmposX: { value: 7.5, min: -10, max: 10, step: 0.1 }, // X-axis control
    cmposY: { value: 3.5, min: -5, max: 5, step: 0.1 }, // Y-axis control
    cmposZ: { value: 6.6, min: -10, max: 10, step: 0.1 }, // Z-axis control
    
  });
  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault // This makes the camera the default for the scene
      position={[cmposX, cmposY, cmposZ]}
      rotation={[8, 7, 8]}  // Set default position
      fov={75} // Field of view
    />
  );
}
