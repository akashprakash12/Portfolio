import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneControls } from "./useSceneControls";

export default function ChimneySmoke({ count: initialCount = 40 }) {
  const { scene } = useThree();
  const groupRef = useRef();
  const particlesRef = useRef([]);
  const spawnTimerRef = useRef(0);
  const foundRef = useRef(false);
  const helperRef = useRef();
  const {
    smokeEnabled,
    smokeCount,
    smokeSpawnInterval,
    smokeSize,
    smokeLifetime,
    smokeColor,
    smokeBuoyancy,
    smokeOpacity,
  } = useSceneControls();

  // ensure particles array exists (ref callbacks will populate `mesh`)
  const count = smokeCount || initialCount;
  if (!particlesRef.current || particlesRef.current.length !== count) {
    particlesRef.current = new Array(count).fill(0).map(() => ({
      mesh: null,
      life: 0,
      lifespan: 0,
      vel: new THREE.Vector3(),
      pos: new THREE.Vector3(),
    }));
  }

  useFrame((state, delta) => {
    const chimney =
      scene.getObjectByName("chemine_Material007_0") || scene.getObjectByName("chemine");
    if (chimney && !foundRef.current) {
      // log once when chimney is first found
      console.log("ChimneySmoke: found chimney ->", chimney.name);
      foundRef.current = true;
    }
    if (!chimney && foundRef.current) {
      console.warn("ChimneySmoke: chimney not found in scene");
      foundRef.current = false;
      return;
    }

    if (!groupRef.current) return;

    // world position of chimney mouth
    const mouthWorld = new THREE.Vector3();
    chimney.getWorldPosition(mouthWorld);

    if (!smokeEnabled) return;

    // spawn rate
    spawnTimerRef.current += delta;
    const spawnInterval = smokeSpawnInterval || 0.08;
    if (spawnTimerRef.current > spawnInterval) {
      spawnTimerRef.current = 0;
      // find dead particle
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        if (p.life <= 0 && p.mesh) {
          // initialize
          // lifespan from control range
          const lifeMin = smokeLifetime[0] || 1.0;
          const lifeMax = smokeLifetime[1] || 2.8;
          p.lifespan = lifeMin + Math.random() * (lifeMax - lifeMin);
          p.life = p.lifespan;
          // small upward velocity with jitter (buoyancy control)
          p.vel.set((Math.random() - 0.5) * 0.06, 0.25 + Math.random() * 0.12, (Math.random() - 0.5) * 0.06);
          // start position just above chimney mouth
          const startWorld = mouthWorld.clone();
          startWorld.y += 0.1 + Math.random() * 0.05;
          // attach particle to scene so we can set world position directly
          try {
            scene.attach(p.mesh);
          } catch (e) {}
          p.pos.copy(startWorld);
          p.mesh.position.copy(p.pos);
          p.mesh.renderOrder = 999;
          if (p.mesh.material) {
            p.mesh.material.depthTest = false;
            p.mesh.material.depthWrite = false;
          }
          p.mesh.visible = true;
          // larger for debug visibility
          // scale using smokeSize control range
          const sizeMin = smokeSize[0] || 0.02;
          const sizeMax = smokeSize[1] || 0.12;
          p.mesh.scale.setScalar(sizeMin + Math.random() * (sizeMax - sizeMin));
          // ensure material is visible and emissive for quick debugging
          if (p.mesh.material) {
            p.mesh.material.color.set(smokeColor || "#ffff66");
            p.mesh.material.emissive && p.mesh.material.emissive.set(smokeColor || "#ffff22");
            p.mesh.material.emissiveIntensity = 0.8;
            p.mesh.material.opacity = smokeOpacity != null ? smokeOpacity : 1;
            p.mesh.material.transparent = true;
            p.mesh.material.depthWrite = false;
          }
          console.log("ChimneySmoke: spawn particle", i, startWorld.toArray());
          break;
        }
      }
    }

    // update particles
    for (let i = 0; i < particlesRef.current.length; i++) {
      const p = particlesRef.current[i];
      if (!p.mesh || p.life <= 0) continue;

      // simple buoyancy + drag
      const buoy = new THREE.Vector3(0, smokeBuoyancy || 0.28, 0);
      p.vel.addScaledVector(buoy, delta);
      p.vel.multiplyScalar(1 - Math.min(delta * 0.5, 0.12));
      p.pos.addScaledVector(p.vel, delta);

      // apply slight horizontal swirl
      p.pos.x += Math.sin(state.clock.elapsedTime * 1.2 + i) * 0.0008;
      p.pos.z += Math.cos(state.clock.elapsedTime * 1.1 + i) * 0.0008;

      p.mesh.position.copy(p.pos);
      // scale and fade
      const t = 1 - p.life / p.lifespan;
      const sizeMin = smokeSize[0] || 0.02;
      const sizeMax = smokeSize[1] || 0.12;
      const scale = sizeMin + t * (sizeMax - sizeMin) * 1.5;
      p.mesh.scale.setScalar(scale);
      if (p.mesh.material) p.mesh.material.opacity = Math.max(0, (smokeOpacity != null ? smokeOpacity : 1) * (1 - t));

      p.life -= delta;
      if (p.life <= 0) {
        p.mesh.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (!particlesRef.current[i]) particlesRef.current[i] = { mesh: el, life: 0, vel: new THREE.Vector3(), pos: new THREE.Vector3(), lifespan: 0 };
            else particlesRef.current[i].mesh = el;
          }}
          visible={false}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#ffff66" transparent opacity={0.9} depthWrite={false} roughness={0.9} metalness={0.0} />
        </mesh>
      ))}
    </group>
  );
}
