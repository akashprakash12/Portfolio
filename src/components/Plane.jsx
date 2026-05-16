import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MeshReflectorMaterial } from "@react-three/drei";
import { useSceneControls } from "../modules/scene/useSceneControls";

export default function Plane() {
  const ref = useRef();
  const splashGroup = useRef();
  const [splashes, setSplashes] = useState([]);
  const lastSpawnRef = useRef(0);

  const {
    waterColor,
    waveSpeed,
    waveFreq,
    waveAmp,
    waterScale,
    waterRoughness,
    waterBlur,
    reflectivity,
    normalScale,
    splashEnabled,
    splashRate,
  } = useSceneControls();

  // spawn splashes occasionally
  useFrame(() => {
    const t = performance.now() / 1000;

    // update reflector time-based distortion shim
    if (ref.current) {
      ref.current.material.uniforms = ref.current.material.uniforms || {};
    }

    // random spawn (keeps surface lively) controlled by splashRate
    if (splashEnabled && Math.random() < splashRate * 0.01) {
      const x = (Math.random() - 0.5) * 18;
      const z = (Math.random() - 0.5) * 18;
      const id = Math.random().toString(36).slice(2, 9);
      setSplashes((s) => [...s, { id, pos: [x, -0.84, z], t0: t }]);
    }

    // animate and cleanup
    setSplashes((list) =>
      list
        .map((s) => ({ ...s, age: t - s.t0 }))
        .filter((s) => s.age < 1.2)
    );
  });

  // spawn ripple at world position
  function spawnRippleAt(point) {
    if (!splashEnabled) return;
    const now = performance.now() / 1000;
    if (now - lastSpawnRef.current < 0.04) return; // 40ms cooldown
    lastSpawnRef.current = now;
    const id = Math.random().toString(36).slice(2, 9);
    setSplashes((s) => [...s, { id, pos: [point.x, point.y + 0.001, point.z], t0: now }]);
  }

  // memoize reflector props
  const normalScaleVec = useMemo(() => new THREE.Vector2(normalScale, normalScale), [normalScale]);

  return (
    <group>
      <mesh
        ref={ref}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.85, 0]}
        receiveShadow
        onPointerDown={(e) => {
          e.stopPropagation();
          spawnRippleAt(e.point);
        }}
        onPointerMove={(e) => {
          // spawn while dragging (left button held)
          if (e.buttons === 1) {
            e.stopPropagation();
            spawnRippleAt(e.point);
          }
        }}
      >
        <planeGeometry args={[20, 20]} />
        <MeshReflectorMaterial
          blur={waterBlur}
          mixStrength={reflectivity}
          mixBlur={30}
          resolution={1024}
          mirror={0.5}
          depthScale={0.5}
          minDepthThreshold={0.9}
          maxDepthThreshold={1.4}
          color={waterColor}
          roughness={waterRoughness}
          metalness={0.5}
          normalScale={normalScaleVec}
          transparent={false}
        />
      </mesh>

      <group ref={splashGroup}>
        {splashes.map((s) => {
          const age = s.age || 0;
          const progress = age / 1.2;
          const scale = 0.1 + progress * 2.5;
          const opacity = Math.max(0, 1 - progress);
          return (
            <mesh
              key={s.id}
              position={s.pos}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[scale, scale, 1]}
            >
              <ringGeometry args={[0.02, 0.05, 32]} />
              <meshBasicMaterial
                color={[1, 1, 1]}
                transparent
                opacity={opacity}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
