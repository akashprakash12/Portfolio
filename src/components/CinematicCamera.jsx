// CinematicCamera.jsx
import { useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CinematicCamera() {
  const { camera, controls } = useThree();


console.log(camera.position);   // x, y, z


  const hasAnimated = useRef(false); // prevent running twice

  // Leva controls (sliders)
  const { camPos, target, fov } = useControls("Camera Controls", {
    camPos: { value: [-8, 2, 9], step: 0.1 },
    target: { value: [0, 1, 0], step: 0.1 },
    fov: { value: 10, min: 10, max: 80, step: 1 }
  });

  /* ========================
        🎬 GSAP CINEMATIC INTRO
     ======================== */
  useEffect(() => {
    if (hasAnimated.current) return; 
    hasAnimated.current = true;

    // Disable Orbit while animating
    if (controls) controls.enabled = false;

    // Initial camera placement
    camera.position.set(-8, 2, 9);
    camera.lookAt(0, 1, 0);

    const tl = gsap.timeline({ ease: "power3.out" });

    tl.to(camera.position, {
      x: -8,
      y: 2,
      z: 15,
      duration: 2
    })
      .to(
        camera.position,
        {
          x: camPos[0],
          y: camPos[1],
          z: camPos[2],
          duration: 2
        },
        "-=1"
      )
      .to(
        {},
        {
          duration: 1,
          onUpdate: () => {
            camera.lookAt(...target);
          }
        },
        "<"
      )
      .eventCallback("onComplete", () => {
        if (controls) controls.enabled = true;
      });
  }, [camera, controls, camPos, target]);

  /* ========================
       🎚 LEVA LIVE CONTROLS
     ======================== */
  useEffect(() => {
    camera.position.set(...camPos);
    camera.fov = fov;
    camera.lookAt(...target);
    camera.updateProjectionMatrix();
  }, [camPos, target, fov, camera]);

  return null;
}
