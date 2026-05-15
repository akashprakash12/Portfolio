import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
export default function Model(props) {
  const { scene } = useGLTF("./models/house.glb");
  const { camera, gl } = useThree();
  const triangleGap = props.triangleGap ?? 0.01;
  const cursorPosition = props.cursorPosition ?? null;
  const touchRadius = props.touchRadius ?? 0.4;
  const scatterIntensity = props.scatterIntensity ?? 0.35;
  const groupProps = { ...props };
  delete groupProps.triangleGap;
  delete groupProps.cursorPosition;
  delete groupProps.touchRadius;
  delete groupProps.scatterIntensity;
  const seedBloomColor = props.seedBloomColor ?? "#fff6d8";
  const seedBloomIntensity = props.seedBloomIntensity ?? 0.6;

  const meshesRef = useRef([]);
  const seedMeshesRef = useRef([]);
  const seedBasePositionsRef = useRef(new Map());
  const seedHoverStartPositionsRef = useRef(new Map());
  const seedHoverProgressRef = useRef(new Map());
  const hoveredSeedRef = useRef(null);
  const seedBaseMaterialRef = useRef(new Map());
  const originalGeometriesRef = useRef(new Map());
  const frameAccumulatorRef = useRef(0);
  const raycasterRef = useRef(new THREE.Raycaster());
  const ndcMouseRef = useRef(new THREE.Vector2(9999, 9999));
  const hoverTargetPositionRef = useMemo(() => new THREE.Vector3(), []);

  // Pre-allocate Vector3 objects for performance
  const tmpCentroid = useMemo(() => new THREE.Vector3(), []);
  const localCursorVec = useMemo(() => new THREE.Vector3(), []);
  const edgeAB = useMemo(() => new THREE.Vector3(), []);
  const edgeAC = useMemo(() => new THREE.Vector3(), []);
  const faceNormal = useMemo(() => new THREE.Vector3(), []);

  const triangleDataRef = useMemo(() => {
    const dataByMesh = new Map();

    scene.traverse((child) => {
      if (!child.isMesh || !child.geometry) return;

      const geometry = child.geometry.clone().toNonIndexed();
      const positionAttribute = geometry.attributes.position;
      if (!positionAttribute) return;

      const triangleCount = positionAttribute.count / 3;
      const centroids = new Float32Array(triangleCount * 3);
      const directions = new Float32Array(triangleCount * 3);
      const smoothedInfluences = new Float32Array(triangleCount);

      for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex++) {
        const vertexIndex = triangleIndex * 9;
        const a = new THREE.Vector3(
          positionAttribute.array[vertexIndex],
          positionAttribute.array[vertexIndex + 1],
          positionAttribute.array[vertexIndex + 2]
        );
        const b = new THREE.Vector3(
          positionAttribute.array[vertexIndex + 3],
          positionAttribute.array[vertexIndex + 4],
          positionAttribute.array[vertexIndex + 5]
        );
        const c = new THREE.Vector3(
          positionAttribute.array[vertexIndex + 6],
          positionAttribute.array[vertexIndex + 7],
          positionAttribute.array[vertexIndex + 8]
        );

        const centroid = new THREE.Vector3().copy(a).add(b).add(c).multiplyScalar(1 / 3);

        // Use face normal as motion direction to avoid center-radial cone deformation.
        edgeAB.copy(b).sub(a);
        edgeAC.copy(c).sub(a);
        faceNormal.copy(edgeAB).cross(edgeAC);
        if (faceNormal.lengthSq() < 1e-10) {
          faceNormal.set(0, 1, 0);
        } else {
          faceNormal.normalize();
        }

        centroids[triangleIndex * 3] = centroid.x;
        centroids[triangleIndex * 3 + 1] = centroid.y;
        centroids[triangleIndex * 3 + 2] = centroid.z;

        directions[triangleIndex * 3] = faceNormal.x;
        directions[triangleIndex * 3 + 1] = faceNormal.y;
        directions[triangleIndex * 3 + 2] = faceNormal.z;
      }

      dataByMesh.set(child, {
        centroids,
        directions,
        smoothedInfluences,
      });
    });

    return dataByMesh;
  }, [scene]);

  useEffect(() => {
    meshesRef.current = [];
    seedMeshesRef.current = [];
    seedBasePositionsRef.current.clear();
    seedHoverStartPositionsRef.current.clear();
    seedHoverProgressRef.current.clear();
    seedBaseMaterialRef.current.clear();

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        meshesRef.current.push(child);

        // Robust seed detection: check mesh name and ancestor names for 'seed'
        let o = child;
        let isSeed = false;
        while (o) {
          if (o.name && o.name.toLowerCase().includes("seed")) {
            isSeed = true;
            break;
          }
          o = o.parent;
        }

        if (isSeed) {
          seedMeshesRef.current.push(child);
          seedBasePositionsRef.current.set(child, child.position.clone());
          seedHoverProgressRef.current.set(child, 0);
          seedBaseMaterialRef.current.set(
            child,
            Array.isArray(child.material)
              ? child.material.map((material) => ({
                  roughness: material?.roughness,
                  metalness: material?.metalness,
                  emissive: material?.emissive?.clone?.() ?? null,
                  emissiveIntensity: material?.emissiveIntensity,
                }))
              : [
                  {
                    roughness: child.material?.roughness,
                    metalness: child.material?.metalness,
                    emissive: child.material?.emissive?.clone?.() ?? null,
                    emissiveIntensity: child.material?.emissiveIntensity,
                  },
                ]
          );

          // Ensure seed materials have emissive properties initialized (start dark)
          const seedMaterials = Array.isArray(child.material) ? child.material : [child.material];
          seedMaterials.forEach((m) => {
            if (!m) return;
            try {
              if (!m.emissive) m.emissive = new THREE.Color(0x000000);
              if (typeof m.emissiveIntensity === "undefined") m.emissiveIntensity = 0;
              m.needsUpdate = true;
            } catch (e) {
              // ignore materials that don't support emissive
            }
          });
        }

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if (!material) return;
          material.wireframe = false;
          material.needsUpdate = true;
          material.shadowSide = 2;
        });

        // Store original geometry
        if (child.geometry) {
          const originalGeometry = child.geometry.clone().toNonIndexed();
          child.geometry = originalGeometry.clone();
          originalGeometriesRef.current.set(child, originalGeometry);
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    const canvas = gl.domElement;

    const updateHoveredSeed = (event) => {
      const rect = canvas.getBoundingClientRect();
      ndcMouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ndcMouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(ndcMouseRef.current, camera);
      // Raycast against all meshes and then walk up the hit object's parent
      // chain to find the nearest ancestor whose name starts with 'seed'.
      const hits = raycasterRef.current.intersectObjects(meshesRef.current, true);
      let found = null;
      for (let i = 0; i < hits.length; i++) {
        let o = hits[i].object;
        while (o) {
          if (o.name && o.name.toLowerCase().includes("seed")) {
            found = o;
            break;
          }
          o = o.parent;
        }
        if (found) break;
      }
      hoveredSeedRef.current = found;
    };

    const clearHoveredSeed = () => {
      hoveredSeedRef.current = null;
    };

    window.addEventListener("pointermove", updateHoveredSeed, { passive: true });
    canvas.addEventListener("pointerleave", clearHoveredSeed);

    return () => {
      window.removeEventListener("pointermove", updateHoveredSeed);
      canvas.removeEventListener("pointerleave", clearHoveredSeed);
    };
  }, [camera, gl]);

  // Animation loop for face separation
  useFrame((state, delta) => {
    frameAccumulatorRef.current += delta;
    const updateInterval = 1 / 60;
    if (frameAccumulatorRef.current < updateInterval) return;
    const stepDelta = frameAccumulatorRef.current;
    frameAccumulatorRef.current = 0;

    meshesRef.current.forEach((mesh) => {
      if (!mesh.geometry || !originalGeometriesRef.current.has(mesh)) return;

      const originalGeometry = originalGeometriesRef.current.get(mesh);
      const positionAttribute = originalGeometry.attributes.position;
      if (!positionAttribute) return;

      const positionArray = mesh.geometry.attributes.position.array;
      const triangleCount = positionAttribute.count / 3;
      const cursor = cursorPosition?.current ?? null;
      const triangleData = triangleDataRef.get(mesh);

      if (!triangleData) return;

      // Convert cursor to local space once per mesh
      let localCursor = null;
      if (cursor) {
        localCursorVec.copy(cursor);
        mesh.worldToLocal(localCursorVec);
        localCursor = localCursorVec;
      }

      const smoothSpeed = 10;
      const epsilon = 0.0005;
      const radiusSq = touchRadius * touchRadius;
      const elapsed = state.clock.elapsedTime;
      let didChange = false;

      for (let i = 0; i < triangleCount; i++) {
        const idx0 = i * 3;
        const idx1 = i * 3 + 1;
        const idx2 = i * 3 + 2;
        const centroidX = triangleData.centroids[idx0];
        const centroidY = triangleData.centroids[idx0 + 1];
        const centroidZ = triangleData.centroids[idx0 + 2];
        const directionX = triangleData.directions[idx0];
        const directionY = triangleData.directions[idx0 + 1];
        const directionZ = triangleData.directions[idx0 + 2];

        // Calculate cursor influence using pre-allocated vector
        let cursorInfluence = 0;
        if (localCursor) {
          tmpCentroid.set(centroidX, centroidY, centroidZ);
          const distanceSq = localCursor.distanceToSquared(tmpCentroid);
          if (distanceSq < radiusSq) {
            const distance = Math.sqrt(distanceSq);
            cursorInfluence = THREE.MathUtils.clamp(1 - distance / touchRadius, 0, 1);
          }
        }

        // Smoothly ease each triangle toward target influence for fluid scattering.
        const previousSmoothed = triangleData.smoothedInfluences[i];
        const smoothed = THREE.MathUtils.damp(
          previousSmoothed,
          cursorInfluence,
          smoothSpeed,
          stepDelta
        );
        triangleData.smoothedInfluences[i] = smoothed;

        // Skip untouched triangles and avoid rewriting vertices unnecessarily.
        if (cursorInfluence <= epsilon && smoothed <= epsilon) {
          if (previousSmoothed > epsilon) {
            const baseOffset = idx0 * 3;
            for (let j = 0; j < 9; j++) {
              positionArray[baseOffset + j] = positionAttribute.array[baseOffset + j];
            }
            didChange = true;
          }
          continue;
        }

        // Gentle low-frequency pulse keeps motion alive without harsh vibration.
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 4 + i * 0.18);
        const wiggleAmount = smoothed * pulse * 0.015;

        // Scattering effect: triangles separate and expand when touched
        const scatterAmount = smoothed * smoothed * scatterIntensity;
        const separation = triangleGap * smoothed;
        const shrink = 1 - scatterAmount * 0.5;

        // Process 3 vertices of the triangle
        for (let j = 0; j < 3; j++) {
          const idx = idx0 + j;
          const vertexOffset = idx * 3;
          const originalX = positionAttribute.array[vertexOffset];
          const originalY = positionAttribute.array[vertexOffset + 1];
          const originalZ = positionAttribute.array[vertexOffset + 2];

          // Apply shrink to center vertices around centroid
          const centeredX = centroidX + (originalX - centroidX) * shrink;
          const centeredY = centroidY + (originalY - centroidY) * shrink;
          const centeredZ = centroidZ + (originalZ - centroidZ) * shrink;

          // Scattering push: move triangle outward from centroid along its normal direction
          const scatterPushX = directionX * scatterAmount * 0.8;
          const scatterPushY = directionY * scatterAmount * 0.8;
          const scatterPushZ = directionZ * scatterAmount * 0.8;

          // Combine wiggle (oscillation) and scatter (radial push)
          const newPosX = centeredX + directionX * wiggleAmount + scatterPushX + directionX * separation;
          const newPosY = centeredY + directionY * wiggleAmount + scatterPushY + directionY * separation;
          const newPosZ = centeredZ + directionZ * wiggleAmount + scatterPushZ + directionZ * separation;

          positionArray[vertexOffset] = newPosX;
          positionArray[vertexOffset + 1] = newPosY;
          positionArray[vertexOffset + 2] = newPosZ;
          didChange = true;
        }
      }

      if (didChange) {
        mesh.geometry.attributes.position.needsUpdate = true;
      }
    });

    const hoveredSeed = hoveredSeedRef.current;
    const hoverElapsed = state.clock.elapsedTime;

    const bloomEnabled = true;
    const bloomColor = "#fff6d8";
    const bloomIntensity = 1.25;
    const glossRoughness = 0.12;
    const glossMetalness = 0.5;
    const seedFloatHeight = 0.18;
    const seedFloatSpeed = 8;
    const seedFloatBob = 0.03;
    const seedFloatScale = 0.025;
    const seedFloatTilt = 0.03;

    seedMeshesRef.current.forEach((mesh, index) => {
      const isHovered = hoveredSeed && (hoveredSeed === mesh || hoveredSeed.parent === mesh);
      const target = isHovered ? 1 : 0;
      const previous = seedHoverProgressRef.current.get(mesh) ?? 0;
      const progress = THREE.MathUtils.damp(previous, target, seedFloatSpeed, delta);
      seedHoverProgressRef.current.set(mesh, progress);

      if (isHovered && !seedHoverStartPositionsRef.current.has(mesh)) {
        seedHoverStartPositionsRef.current.set(mesh, mesh.position.clone());
      }

      const basePosition = isHovered
        ? seedHoverStartPositionsRef.current.get(mesh) ?? seedBasePositionsRef.current.get(mesh)
        : seedBasePositionsRef.current.get(mesh);
      if (!basePosition) return;

      if (!isHovered && progress <= 0.001) {
        seedHoverStartPositionsRef.current.delete(mesh);
      }

      hoverTargetPositionRef.copy(basePosition);
      hoverTargetPositionRef.y += progress * seedFloatHeight + Math.sin(hoverElapsed * 4 + index * 0.35) * progress * seedFloatBob;
      mesh.position.lerp(hoverTargetPositionRef, isHovered ? 0.14 : 0.08);
      mesh.rotation.z = Math.sin(hoverElapsed * 2.8 + index * 0.25) * progress * seedFloatTilt;
      mesh.scale.setScalar(1 + progress * seedFloatScale);

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const materialStates = seedBaseMaterialRef.current.get(mesh) || [];

      materials.forEach((material, materialIndex) => {
        if (!material) return;
        const baseState = materialStates[materialIndex] || {};

        const targetRoughness = isHovered ? glossRoughness : baseState.roughness ?? material.roughness;
        const targetMetalness = isHovered ? glossMetalness : baseState.metalness ?? material.metalness;

        material.roughness = THREE.MathUtils.damp(
          material.roughness ?? targetRoughness,
          targetRoughness,
          10,
          delta
        );
        material.metalness = THREE.MathUtils.damp(
          material.metalness ?? targetMetalness,
          targetMetalness,
          10,
          delta
        );

        if (bloomEnabled && material.emissive) {
          const glow = new THREE.Color(bloomColor);
          // Smoothly ramp emissive color/intensity based on hover progress
          const targetEmissive = glow;
          material.emissive.lerp(targetEmissive, progress * 0.65);
          material.emissiveIntensity = THREE.MathUtils.damp(
            material.emissiveIntensity ?? 0,
            progress * bloomIntensity,
            10,
            delta
          );
        }

        material.needsUpdate = true;
      });
    });

  });

  return (
    <group {...groupProps}>
      <primitive
        object={scene}
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
        }}
      />
    </group>
  );
}

// Required for caching
useGLTF.preload("./models/house.glb");
