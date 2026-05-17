// CinematicCamera.jsx
import React from "react";
import { useThree } from "@react-three/fiber";
import { useControls, folder } from "leva";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const isDev = import.meta.env.DEV;

const readControls = (groupName, schema) => {
  if (!isDev) {
    return Object.fromEntries(
      Object.entries(schema).map(([key, config]) => [
        key,
        Array.isArray(config?.value) ? [...config.value] : config?.value,
      ]),
    );
  }

  return useControls(groupName, schema);
};

function CinematicCamera({ targetCamPos = null, targetCamLookAt = null, activeSection = 0 }) {
  const { camera, controls } = useThree();

  const hasAnimated = useRef(false);
  const isTransitioning = useRef(false);
  const activeTween = useRef(null);

  // ─── Default / Home camera ───────────────────────────────────────────────
  const { camPos, target, fov } = readControls("Camera Controls", {
    camPos: { value: [0, 0, 6], step: 0.1 },
    target: { value: [0, 1, 0], step: 0.1 },
    fov:    { value: 53, min: 10, max: 80, step: 1 },
  });

  // ─── About section camera ────────────────────────────────────────────────
  // Tweak these values while you're on the About slide; they take effect live.
  const { aboutCamPos, aboutTarget, aboutFov } = readControls("About Camera", {
    aboutCamPos: { value: [-5.9, 0, 6], step: 0.1, label: "Position" },
    aboutTarget: { value: [0, 1, 0],    step: 0.1, label: "Look At"  },
    aboutFov:    { value: 53, min: 10, max: 80, step: 1, label: "FOV" },
  });

  // ─── Skills section camera ───────────────────────────────────────────────
  // Add Leva controls for the Skills slide so you can tweak position/target/FOV
  const { skillsCamPos, skillsTarget, skillsFov } = readControls("Skills Camera", {
    skillsCamPos: { value: [-6.3, 0.3, -6.9], step: 0.1, label: "Position" },
    skillsTarget: { value: [0, 0, 0],        step: 0.1, label: "Look At"  },
    skillsFov:    { value: 80, min: 10, max: 80, step: 1, label: "FOV" },
  });

  // ─── Contact section camera ──────────────────────────────────────────────
  const { contactCamPos, contactTarget, contactFov } = readControls("Contact Camera", {
    contactCamPos: { value: [-10.7, 3.5, -1.6], step: 0.1, label: "Position" },
    contactTarget: { value: [0, -0.2, 0],        step: 0.1, label: "Look At"  },
    contactFov:    { value: 80, min: 10, max: 80, step: 1, label: "FOV" },
  });

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const camPosKey      = camPos.join(",");
  const targetKey      = target.join(",");
  const aboutCamPosKey = aboutCamPos.join(",");
  const aboutTargetKey = aboutTarget.join(",");
  const skillsCamPosKey = skillsCamPos.join(",");
  const skillsTargetKey = skillsTarget.join(",");
  const contactCamPosKey = contactCamPos.join(",");
  const contactTargetKey = contactTarget.join(",");
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
    } else if (activeSection === 2) {
      // Use Skills-specific Leva camera when on Skills section
      animateCamera(skillsCamPos, skillsTarget, 2.2, "power3.out");
      camera.fov = skillsFov;
      camera.updateProjectionMatrix();
    } else if (activeSection === 4) {
      // Use Contact-specific Leva camera when on Contact section
      animateCamera(contactCamPos, contactTarget, 2.2, "power3.out");
      camera.fov = contactFov;
      camera.updateProjectionMatrix();
    } else if (targetCamPos) {
      // All other sections use the positions passed from Scene
      animateCamera(targetCamPos, targetCamLookAt || target, 1.5, "power2.inOut");
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [activeSection, targetCamPosKey, targetCamLookAtKey, aboutCamPosKey, aboutTargetKey, skillsCamPosKey, skillsTargetKey, contactCamPosKey, contactTargetKey, camera, controls, targetKey, fov, aboutFov, skillsFov, contactFov]);

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

  // ─── Live Leva updates (Skills camera) ───────────────────────────────────
  useEffect(() => {
    if (activeSection !== 2) return; // only apply when on Skills section

    animateCamera(skillsCamPos, skillsTarget, 0.9, "power3.out");
    camera.fov = skillsFov;
    camera.updateProjectionMatrix();
  }, [skillsCamPosKey, skillsTargetKey, skillsFov, camera, controls, activeSection]);

  // ─── Live Leva updates (Contact camera) ─────────────────────────────────
  useEffect(() => {
    if (activeSection !== 4) return; // only apply when on Contact section

    animateCamera(contactCamPos, contactTarget, 0.9, "power3.out");
    camera.fov = contactFov;
    camera.updateProjectionMatrix();
  }, [contactCamPosKey, contactTargetKey, contactFov, camera, controls, activeSection]);

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (activeTween.current) activeTween.current.kill();
    };
  }, []);

  return null;
}

export default React.memo(CinematicCamera);