import { Center, Grid, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { Suspense, useRef } from "react";
import { Model } from "../Butterfly";
import gsap from "gsap";
import { MeshStandardMaterial } from "three";

const animations = {
  move: (mesh, toPosition) => {
    gsap.to(mesh.position, {
      x: toPosition.x,
      y: toPosition.y,
      z: toPosition.z,
      duration: 2,
    });
  },
};

export default function Box() {
  const boxRef = useRef();

  useFrame(() => {
    
  });
  return (
    <group  position={[0, -0.5, 0]} ref={boxRef}>
      <Center top position={[2.5, 0, 1]}>
        <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#9d4b4b" />
        </mesh>
      </Center>
    </group>
  );
}
