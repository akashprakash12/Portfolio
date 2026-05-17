import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Smooth cinematic mouse parallax for the camera.
// Keeps motion subtle so it feels premium instead of game-like.
export default function CameraParallax({
  basePosition = [0, 0, 6],
  baseLookAt = [0, 1, 0],
  enabled = true,
  intensity = 0.18,
  verticalIntensity = 0.12,
  damping = 4.5,
}) {
  const { camera, mouse, size } = useThree();
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const lookAtTarget = useMemo(() => new THREE.Vector3(), []);
  const basePositionRef = useRef(new THREE.Vector3(...basePosition));
  const baseLookAtRef = useRef(new THREE.Vector3(...baseLookAt));

  useEffect(() => {
    basePositionRef.current.set(...basePosition);
    baseLookAtRef.current.set(...baseLookAt);
  }, [basePosition, baseLookAt]);

  useFrame((state, delta) => {
    if (!enabled) return;

    const scale = Math.min(1, size.width / 1440);
    const smoothIntensity = intensity * (0.55 + scale * 0.45);
    const smoothVerticalIntensity = verticalIntensity * (0.55 + scale * 0.45);
    const driftX = mouse.x * smoothIntensity;
    const driftY = mouse.y * smoothVerticalIntensity;

    targetPosition.set(
      basePositionRef.current.x + driftX,
      basePositionRef.current.y + driftY,
      basePositionRef.current.z,
    );

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPosition.x, damping, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPosition.y, damping, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPosition.z, damping, delta);

    lookAtTarget.copy(baseLookAtRef.current);
    camera.lookAt(lookAtTarget);
  });

  return null;
}
