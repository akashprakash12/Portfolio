import React from "react";

const Plane = () => (
  <mesh
    rotation={[-Math.PI / 2, 0, 0]}
    position={[0, -0.85, 0]}
    receiveShadow
  >
    <planeGeometry args={[20, 20]} />
    <meshStandardMaterial
      color="#0f172a"
      roughness={1}
      metalness={0}
      side={2}
    />
  </mesh>
);

export default Plane;
