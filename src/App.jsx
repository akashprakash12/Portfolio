import { memo, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Box from "./componet/box";

import { Canvas } from "@react-three/fiber";
import {
  AccumulativeShadows,
  Center,
  Environment,
  GizmoHelper,
  GizmoViewport,
  Grid,
  OrbitControls,
  RandomizedLight,
  useGLTF,
} from "@react-three/drei";
import Shadows from "./componet/Shadows";
import Text from "./componet/Text";
import Textt from "./componet/Text";
import Camera from "./componet/Camera";

function Suzi(props) {
  const { nodes } = useGLTF(
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/suzanne-high-poly/model.gltf"
  );
  return (
    <mesh castShadow receiveShadow geometry={nodes.Suzanne.geometry} {...props}>
      <meshStandardMaterial color="#9d4b4b" />
    </mesh>
  );
}

function App() {
  const [count, setCount] = useState(0);
  

  return (
    <Canvas shadows camera={{ position: [10,15,12], fov: 25 }}>
      <Camera></Camera>
      <group position={[0, -0.5, 0]}>
        <Center top>
          {/* <Suzi rotation={[-0.63, 0, 0]} scale={2} /> */}
          <Box></Box>
        </Center>
        
      </group>
      <Textt></Textt>
      <OrbitControls makeDefault />
      <Environment preset="city" />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport
          axisColors={["#9d4b4b", "#2f7f4f", "#3b5b9d"]}
          labelColor="white"
        />
      </GizmoHelper>
    </Canvas>
  );
}

export default App;
