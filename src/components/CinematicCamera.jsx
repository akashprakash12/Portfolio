// CinematicCamera.jsx
import React from "react";
import { useThree } from "@react-three/fiber";
import { useControls, folder } from "leva";
import { useEffect, useRef } from "react";
import gsap from "gsap";

function CinematicCamera({ targetCamPos = null, targetCamLookAt = null, activeSection = 0 }) {
  const { camera, controls } = useThree();

  const hasAnimated = useRef(false);
  const isTransitioning = useRef(false);
  const activeTween = useRef(null);

  // ─── Default / Home camera ───────────────────────────────────────────────
  const { camPos, target, fov } = useControls("Camera Controls", {
    camPos: { value: [0, 0, 6], step: 0.1 },
    target: { value: [0, 1, 0], step: 0.1 },
    fov:    { value: 53, min: 10, max: 80, step: 1 },
  });

  // ─── About section camera ────────────────────────────────────────────────
  // Tweak these values while you're on the About slide; they take effect live.
  const { aboutCamPos, aboutTarget, aboutFov } = useControls("About Camera", {
    aboutCamPos: { value: [-5.9, 0, 6], step: 0.1, label: "Position" },
    aboutTarget: { value: [0, 1, 0],    step: 0.1, label: "Look At"  },
    aboutFov:    { value: 53, min: 10, max: 80, step: 1, label: "FOV" },
  });

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const camPosKey      = camPos.join(",");
  const targetKey      = target.join(",");
  const aboutCamPosKey = aboutCamPos.join(",");
  const aboutTargetKey = aboutTarget.join(",");
  const targetCamPosKey = targetCamPos ? targetCamPos.join(",") : "";
  const targetCamLookAtKey = targetCamLookAt ? targetCamLookAt.join(",") : "";

  const animateCamera = (nextPosition, nextTarget, duration, ease, onComplete) => {
    if (!nextPosition) return;

    if (activeTween.current) activeTween.current.kill();

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

  // ─── Cinematic intro ──────────────────────────────────────────────────────
  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    camera.position.set(-8, 2, 9);
    camera.lookAt(0, 1, 0);
    animateCamera(camPos, target, 3, "power3.out");
  }, [camera, controls, camPosKey, targetKey]);

  // ─── Section-based camera switch ─────────────────────────────────────────
  useEffect(() => {
    if (activeSection === 1) {
      // Use the dedicated About camera position from Leva
      animateCamera(aboutCamPos, aboutTarget, 1.5, "power2.inOut");
      camera.fov = aboutFov;
      camera.updateProjectionMatrix();
    } else if (targetCamPos) {
      // All other sections use the positions passed from Scene
      animateCamera(targetCamPos, targetCamLookAt || target, 1.5, "power2.inOut");
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [activeSection, targetCamPosKey, targetCamLookAtKey, aboutCamPosKey, aboutTargetKey, camera, controls, targetKey, fov, aboutFov]);

  // ─── Live Leva updates (default camera) ──────────────────────────────────
  useEffect(() => {
    // Only apply live default-camera (Leva) updates when on the Home section.
    // This prevents the default Leva animation from overriding explicit
    // section-based transitions (e.g., Skills, Projects, Contact).
    if (activeSection !== 0) return;

    animateCamera(camPos, target, 0.8, "power2.out");
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [camPosKey, targetKey, fov, camera, controls, activeSection]);

  // ─── Live Leva updates (About camera) ────────────────────────────────────
  useEffect(() => {
    if (activeSection !== 1) return; // only apply when on About section

    animateCamera(aboutCamPos, aboutTarget, 0.5, "power2.out");
    camera.fov = aboutFov;
    camera.updateProjectionMatrix();
  }, [aboutCamPosKey, aboutTargetKey, aboutFov, camera, controls, activeSection]);

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (activeTween.current) activeTween.current.kill();
    };
  }, []);

  return null;
}

export default React.memo(CinematicCamera);