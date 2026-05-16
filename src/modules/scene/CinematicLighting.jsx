import React, { useEffect, useRef } from "react";
import { useHelper } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

export default function CinematicLighting({
  // Key light
  keyPosition = [6, 12, 6],
  keyIntensity = 0.35,
  keyColor = "#c8d9ff",
  // Fill light
  fillPosition = [-6, 3, -5],
  fillIntensity = 5,
  fillColor = "#ffd3a1",
  fillDistance = 28,
}) {
  const keyLightRef = useRef();
  const fillLightRef = useRef();
  const fillPulseRef = useRef({ intensity: fillIntensity });

  useHelper(keyLightRef, THREE.DirectionalLightHelper, 1.5, "#8db3ff");
  useHelper(fillLightRef, THREE.PointLightHelper, 0.5, "#ffd3a1");

  useEffect(() => {
    fillPulseRef.current.intensity = fillIntensity;

    const tween = gsap.to(fillPulseRef.current, {
      intensity: fillIntensity + 0.12,
      duration: 2.2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      onUpdate: () => {
        if (fillLightRef.current) {
          fillLightRef.current.intensity = fillPulseRef.current.intensity;
        }
      },
    });

    return () => tween.kill();
  }, [fillIntensity]);

  return (
    <>
      <directionalLight
        ref={keyLightRef}
        position={keyPosition}
        intensity={keyIntensity}
        color={keyColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-radius={4}
      />

      <pointLight
        ref={fillLightRef}
        position={fillPosition}
        intensity={fillIntensity}
        distance={fillDistance}
        color={fillColor}
      />
    </>
  );
}