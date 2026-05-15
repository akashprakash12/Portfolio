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
  delete groupProps.cubeHoverEnabled;
  delete groupProps.cubeFloatHeight;
  delete groupProps.cubeFloatSpeed;
  delete groupProps.cubeFloatBob;
  delete groupProps.cubeFloatScale;
  delete groupProps.cubeFloatTilt;
  delete groupProps.cubeBloomEnabled;
  delete groupProps.cubeBloomColor;
  delete groupProps.cubeBloomIntensity;
  delete groupProps.cubeGlossRoughness;
  delete groupProps.cubeGlossMetalness;

  const meshesRef = useRef([]);
  const cubeMeshesRef = useRef([]);
  const cubeBasePositionsRef = useRef(new Map());
  const cubeHoverProgressRef = useRef(new Map());
  const hoveredCubeRef = useRef(null);
  const cubeBaseMaterialRef = useRef(new Map());
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
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        meshesRef.current.push(child);

        if (child.name?.startsWith("Cube")) {
          cubeMeshesRef.current.push(child);
          cubeBasePositionsRef.current.set(child, child.position.clone());
          cubeHoverProgressRef.current.set(child, 0);
          cubeBaseMaterialRef.current.set(
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

    const updateHoveredCube = (event) => {
      const rect = canvas.getBoundingClientRect();
      ndcMouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ndcMouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(ndcMouseRef.current, camera);
      const hits = raycasterRef.current.intersectObjects(cubeMeshesRef.current, true);
      hoveredCubeRef.current = hits.length > 0 ? hits[0].object : null;
    };

    const clearHoveredCube = () => {
      hoveredCubeRef.current = null;
    };

    window.addEventListener("pointermove", updateHoveredCube, { passive: true });
    canvas.addEventListener("pointerleave", clearHoveredCube);

    return () => {
      window.removeEventListener("pointermove", updateHoveredCube);
      canvas.removeEventListener("pointerleave", clearHoveredCube);
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

    const hoveredCube = hoveredCubeRef.current;
    const hoverElapsed = state.clock.elapsedTime;
    const bloomEnabled = props.cubeBloomEnabled ?? true;
    const bloomColor = props.cubeBloomColor ?? "#ffffff";
    const bloomIntensity = props.cubeBloomIntensity ?? 1.1;
    const glossRoughness = props.cubeGlossRoughness ?? 0.22;
    const glossMetalness = props.cubeGlossMetalness ?? 0.35;
    const cubeFloatHeight = props.cubeFloatHeight ?? 0.22;
    const cubeFloatSpeed = props.cubeFloatSpeed ?? 8;
    const cubeFloatBob = props.cubeFloatBob ?? 0.04;
    const cubeFloatScale = props.cubeFloatScale ?? 0.03;
    const cubeFloatTilt = props.cubeFloatTilt ?? 0.04;

    cubeMeshesRef.current.forEach((mesh, index) => {
      const isHovered = hoveredCube && (hoveredCube === mesh || hoveredCube.parent === mesh);
      const target = isHovered ? 1 : 0;
      const previous = cubeHoverProgressRef.current.get(mesh) ?? 0;
      const progress = THREE.MathUtils.damp(previous, target, cubeFloatSpeed, delta);
      cubeHoverProgressRef.current.set(mesh, progress);

      const basePosition = cubeBasePositionsRef.current.get(mesh);
      if (!basePosition) return;

      hoverTargetPositionRef.copy(basePosition);
      hoverTargetPositionRef.y += progress * cubeFloatHeight + Math.sin(hoverElapsed * 4 + index * 0.35) * progress * cubeFloatBob;
      mesh.position.lerp(hoverTargetPositionRef, isHovered ? 0.14 : 0.08);
      mesh.rotation.z = Math.sin(hoverElapsed * 2.8 + index * 0.25) * progress * cubeFloatTilt;
      mesh.scale.setScalar(1 + progress * cubeFloatScale);

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const materialStates = cubeBaseMaterialRef.current.get(mesh) || [];

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
          material.emissive.lerp(glow, progress * 0.65);
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
