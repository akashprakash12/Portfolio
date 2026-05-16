// CinematicCamera.jsx
import React from "react";
import { useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import gsap from "gsap";

function CinematicCamera({ targetCamPos = null, activeSection = 0 }) {
  const { camera, controls } = useThree();

  const hasAnimated = useRef(false); // prevent running twice
  const isTransitioning = useRef(false);
  const activeTween = useRef(null);

  // Leva controls (sliders)
  const { camPos, target, fov } = useControls("Camera Controls", {
    camPos: { value: [0, 0, 6], step: 0.1 },
    target: { value: [0, 1, 0], step: 0.1 },
    fov: { value: 53, min: 10, max: 80, step: 1 },
  });

  // keep a base camera position for subtle idle motion
  const baseCam = useRef([...camPos]);
  const camPosKey = camPos.join(",");
  const targetKey = target.join(",");
  const targetCamPosKey = targetCamPos ? targetCamPos.join(",") : "";

  const animateCamera = (nextPosition, nextTarget, duration, ease, onComplete) => {
    if (!nextPosition) return;

    if (activeTween.current) {
      activeTween.current.kill();
    }

    isTransitioning.current = true;
    if (controls) controls.enabled = false;

    activeTween.current = gsap.to(camera.position, {
      x: nextPosition[0],
      y: nextPosition[1],
      z: nextPosition[2],
      duration,
      ease,
      onUpdate: () => {
        camera.lookAt(...nextTarget);
      },
      onComplete: () => {
        camera.position.set(...nextPosition);
        camera.lookAt(...nextTarget);
        camera.updateProjectionMatrix();
        if (controls) controls.enabled = true;
        isTransitioning.current = false;
        activeTween.current = null;
        if (onComplete) onComplete();
      },
    });
  };
  /* ========================
        🎬 GSAP CINEMATIC INTRO
     ======================== */
  useEffect(() => {
    if (hasAnimated.current) return; 
    hasAnimated.current = true;

    // Initial camera placement
    camera.position.set(-8, 2, 9);
    camera.lookAt(0, 1, 0);
    animateCamera(camPos, target, 3, "power3.out");
  }, [camera, controls, camPosKey, targetKey]);

  /* ========================
     SECTION-BASED CAMERA ANIMATION
     ======================== */
  useEffect(() => {
    if (!targetCamPos) return;
    animateCamera(targetCamPos, target, 1.5, "power2.inOut", () => {
      baseCam.current = [...targetCamPos];
    });
  }, [targetCamPosKey, camera, controls, targetKey]);

  /* ========================
       🎚 LEVA LIVE CONTROLS
     ======================== */
  useEffect(() => {
    // Leva updates animate through GSAP instead of snapping.
    animateCamera(camPos, target, 0.8, "power2.out", () => {
      baseCam.current = [...camPos];
    });
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [camPosKey, targetKey, fov, camera]);

  useEffect(() => {
    return () => {
      if (activeTween.current) {
        activeTween.current.kill();
      }
    };
  }, []);

  return null;
}

export default React.memo(CinematicCamera);
