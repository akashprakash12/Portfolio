export default function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />

      <pointLight
        position={[2, 3, 2]}
        intensity={15}
        color="#4f8cff"
      />

      <directionalLight
        position={[5, 10, 5]}
        castShadow
        intensity={1}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <spotLight
        position={[10, 15, 10]}
        angle={0.3}
        castShadow
        intensity={1}
      />
    </>
  );
}
