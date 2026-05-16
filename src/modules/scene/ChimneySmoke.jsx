import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function ChimneySmoke({ count = 40 }) {
  const { scene } = useThree();
  const groupRef = useRef();
  const particlesRef = useRef([]);
  const spawnTimerRef = useRef(0);

  // initialize particle placeholders
  useEffect(() => {
    particlesRef.current = new Array(count).fill(0).map(() => ({
      mesh: null,
      life: 0,
      lifespan: 0,
      vel: new THREE.Vector3(),
      pos: new THREE.Vector3(),
    }));
  }, [count]);

  useFrame((state, delta) => {
    const chimney =
      scene.getObjectByName("chemine_Material007_0") || scene.getObjectByName("chemine");
    if (!chimney) return;

    // world position of chimney mouth
    const mouthWorld = new THREE.Vector3();
    chimney.getWorldPosition(mouthWorld);

    // spawn rate
    spawnTimerRef.current += delta;
    const spawnInterval = 0.08;
    if (spawnTimerRef.current > spawnInterval) {
      spawnTimerRef.current = 0;
      // find dead particle
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        if (p.life <= 0 && p.mesh) {
          // initialize
          p.lifespan = 1.6 + Math.random() * 1.2;
          p.life = p.lifespan;
          // small upward velocity with jitter
          p.vel.set((Math.random() - 0.5) * 0.06, 0.3 + Math.random() * 0.12, (Math.random() - 0.5) * 0.06);
          // start position just above chimney mouth
          const startWorld = mouthWorld.clone();
          startWorld.y += 0.1 + Math.random() * 0.05;
          // convert to local of this group
          const startLocal = groupRef.current.worldToLocal(startWorld);
          p.pos.copy(startLocal);
          p.mesh.position.copy(p.pos);
          p.mesh.visible = true;
          p.mesh.scale.setScalar(0.01 + Math.random() * 0.02);
          break;
        }
      }
    }

    // update particles
    for (let i = 0; i < particlesRef.current.length; i++) {
      const p = particlesRef.current[i];
      if (!p.mesh || p.life <= 0) continue;

      // simple buoyancy + drag
      const buoy = new THREE.Vector3(0, 0.28, 0);
      p.vel.addScaledVector(buoy, delta);
      p.vel.multiplyScalar(1 - Math.min(delta * 0.5, 0.12));
      p.pos.addScaledVector(p.vel, delta);

      // apply slight horizontal swirl
      p.pos.x += Math.sin(state.clock.elapsedTime * 1.2 + i) * 0.0008;
      p.pos.z += Math.cos(state.clock.elapsedTime * 1.1 + i) * 0.0008;

      p.mesh.position.copy(p.pos);
      // scale and fade
      const t = 1 - p.life / p.lifespan;
      const scale = 0.02 + t * 0.05;
      p.mesh.scale.setScalar(scale);
      if (p.mesh.material) p.mesh.material.opacity = Math.max(0, 0.9 * (1 - t));

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
          <meshStandardMaterial color="#bdbdbd" transparent opacity={0.9} depthWrite={false} roughness={0.9} metalness={0.0} />
        </mesh>
      ))}
    </group>
  );
}
