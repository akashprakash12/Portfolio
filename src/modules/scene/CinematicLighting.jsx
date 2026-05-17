import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
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
  showLightHelpers = false,
}) {
  const keyLightRef = useRef();
  const fillLightRef = useRef();
  const fillPulseRef = useRef({ intensity: fillIntensity });

  const { scene } = useThree();
  const dirHelperRef = useRef();
  const pointHelperRef = useRef();

  useEffect(() => {
    // cleanup existing helpers first
    if (dirHelperRef.current) {
      scene.remove(dirHelperRef.current);
      dirHelperRef.current = null;
    }
    if (pointHelperRef.current) {
      scene.remove(pointHelperRef.current);
      pointHelperRef.current = null;
    }

    if (showLightHelpers) {
      if (keyLightRef.current) {
        dirHelperRef.current = new THREE.DirectionalLightHelper(keyLightRef.current, 1.5, "#8db3ff");
        scene.add(dirHelperRef.current);
      }
      if (fillLightRef.current) {
        pointHelperRef.current = new THREE.PointLightHelper(fillLightRef.current, 0.5, "#ffd3a1");
        scene.add(pointHelperRef.current);
      }
    }

    return () => {
      if (dirHelperRef.current) {
        scene.remove(dirHelperRef.current);
        dirHelperRef.current = null;
      }
      if (pointHelperRef.current) {
        scene.remove(pointHelperRef.current);
        pointHelperRef.current = null;
      }
    };
  }, [showLightHelpers, keyColor, fillColor, scene]);

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