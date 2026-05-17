import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Adds a soft floating motion and a tiny mouse-follow rotation to the hero model.
export default function FloatingModel({
  children,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  enabled = true,
  floatAmount = 0.08,
  floatSpeed = 0.7,
  rotationAmount = 0.035,
  driftAmount = 0.06,
}) {
  const groupRef = useRef();
  const basePosition = useMemo(() => new THREE.Vector3(...position), [position]);
  const baseRotation = useMemo(() => new THREE.Euler(...rotation), [rotation]);
  const baseScale = useMemo(() => (typeof scale === "number" ? scale : scale?.[0] ?? 1), [scale]);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(basePosition);
    groupRef.current.rotation.copy(baseRotation);
    groupRef.current.scale.setScalar(baseScale);
  }, [basePosition, baseRotation, baseScale]);

  useFrame((state, delta) => {
    if (!groupRef.current || !enabled) return;

    const { mouse, clock } = state;
    const breathe = Math.sin(clock.elapsedTime * floatSpeed) * floatAmount;
    const subtleX = mouse.x * driftAmount;
    const subtleY = mouse.y * driftAmount * 0.7;

    targetPosition.set(
      basePosition.x + subtleX,
      basePosition.y + breathe + subtleY,
      basePosition.z,
    );

    const smooth = 1 - Math.pow(0.001, delta);
    groupRef.current.position.lerp(targetPosition, smooth);

    const targetRotX = baseRotation.x + mouse.y * rotationAmount;
    const targetRotY = baseRotation.y + mouse.x * rotationAmount;
    const targetRotZ = baseRotation.z + Math.sin(clock.elapsedTime * 0.35) * rotationAmount * 0.25;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, smooth);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, smooth);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, smooth);
  });

  return <group ref={groupRef}>{children}</group>;
}
