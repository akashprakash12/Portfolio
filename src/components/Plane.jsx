import React from "react";

const Plane = () => (
  <mesh
    rotation={[-Math.PI / 2, 0, 0]}
    position={[0, -0.5, 0]}
    receiveShadow
  >
    <planeGeometry args={[20, 20]} />
    <meshBasicMaterial color="#3b3a3e" side={2} />
  </mesh>
);

export default Plane;
