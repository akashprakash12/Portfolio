import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

export default function Model(props) {
  const { scene } = useGLTF("./models/angel.glb");

    useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Important for soft shadows
        child.material.shadowSide = 2;
      }
    });
  }, [scene]);

  return (
    <primitive object={scene} {...props} onClick={(e)=>{
        e.stopPropagation();
        console.log("Angel model clicked");

    }} />
  );
}

// Required for caching
useGLTF.preload("./models/angel.glb");
