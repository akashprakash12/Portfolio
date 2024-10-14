import { Center, Grid, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { Suspense, useRef, useState } from "react";
import { useControls } from "leva";
import { Model } from "../Butterfly";
import gsap from "gsap";
import { MeshStandardMaterial } from "three";

export default function Box(props) {
  const mesh = useRef();
  const { posX, posY, posZ, scale } = useControls({
    posX: { value: 7.5, min: -10, max: 10, step: 0.1 },  // X-axis control
    posY: { value: 3.5, min: -5, max: 5, step: 0.1 },     // Y-axis control
    posZ: { value: 6.6, min: -10, max: 10, step: 0.1 },   // Z-axis control
    scale: { value: 1, min: 0.5, max: 2, step: 0.1 },  // Scale control
  });
  const [active, setActive] = useState(false);
  const { viewport } = useThree();
  useFrame(() => {});
  return (
    <group position={[0, -0.5, 0]}>
      <Center top position={[posX,posY,posZ]}>
        <mesh
          castShadow
          {...props}
          ref={mesh}
          scale={(viewport.width / 5) * (active ? 1.5 : scale)}
        >
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial />
        </mesh>
      </Center>
    </group>
  );
}
