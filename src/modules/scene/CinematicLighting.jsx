import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useHelper } from "@react-three/drei";
import * as THREE from "three";

export default function CinematicLighting() {
  const keyLightRef = useRef();
  const movingSpotRef = useRef();
  const fillLightRef = useRef();
  const glowRef = useRef();

  useHelper(keyLightRef, THREE.DirectionalLightHelper, 1.5, "#8db3ff");
  useHelper(movingSpotRef, THREE.SpotLightHelper, "#2f80ff");

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;

    if (movingSpotRef.current) {
      movingSpotRef.current.position.set(
        Math.sin(elapsed * 0.35) * 6,
        5 + Math.sin(elapsed * 0.5) * 1.2,
        7 + Math.cos(elapsed * 0.25) * 3
      );
      movingSpotRef.current.target.position.set(0, 1, 0);
      movingSpotRef.current.target.updateMatrixWorld();
      movingSpotRef.current.intensity = 4.5 + Math.sin(elapsed * 1.2) * 0.35;
    }

    if (fillLightRef.current) {
      fillLightRef.current.intensity = 1 + Math.sin(elapsed * 0.9) * 0.12;
    }

    if (glowRef.current) {
      const pulse = 1.2 + Math.sin(elapsed * 2) * 0.2;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <>
      <directionalLight
        ref={keyLightRef}
        position={[6, 12, 6]}
        intensity={1.35}
        color="#c8d9ff"
        castShadow
      />

      <spotLight
        ref={movingSpotRef}
        position={[0, 6, 10]}
        intensity={12}
        angle={0.5}
        penumbra={1}
        distance={40}
        decay={2}
        color="#2f80ff"
        castShadow
      />

      <pointLight
        ref={fillLightRef}
        position={[-6, 3, -5]}
        intensity={2}
        distance={28}
        color="#ffd3a1"
      />

      <mesh ref={glowRef} position={[0, 6, 10]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial color="#2f80ff" toneMapped={false} />
      </mesh>
    </>
  );
}