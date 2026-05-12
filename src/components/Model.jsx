import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Model(props) {
  const { scene } = useGLTF("./models/angel.glb");
  const [isHovered, setIsHovered] = useState(false);
  const triangleGap = props.triangleGap ?? 0.01;
  const cursorPosition = props.cursorPosition ?? null;
  const touchRadius = props.touchRadius ?? 0.4;
  const groupProps = { ...props };
  delete groupProps.triangleGap;
  delete groupProps.cursorPosition;
  delete groupProps.touchRadius;

  const meshesRef = useRef([]);
  const originalGeometriesRef = useRef(new Map());
  const progressRef = useRef(0);

  const triangleDataRef = useMemo(() => {
    const dataByMesh = new Map();

    scene.traverse((child) => {
      if (!child.isMesh || !child.geometry) return;

      const geometry = child.geometry.clone().toNonIndexed();
      const positionAttribute = geometry.attributes.position;
      if (!positionAttribute) return;

      const modelCenter = new THREE.Vector3();
      for (let i = 0; i < positionAttribute.count; i++) {
        modelCenter.x += positionAttribute.getX(i);
        modelCenter.y += positionAttribute.getY(i);
        modelCenter.z += positionAttribute.getZ(i);
      }
      modelCenter.multiplyScalar(1 / positionAttribute.count);

      const triangleCount = positionAttribute.count / 3;
      const centroids = new Float32Array(triangleCount * 3);
      const directions = new Float32Array(triangleCount * 3);
      const sizes = new Float32Array(triangleCount);

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
        const direction = centroid.clone().sub(modelCenter).normalize();
        const edge1 = a.distanceTo(b);
        const edge2 = b.distanceTo(c);
        const edge3 = c.distanceTo(a);

        centroids[triangleIndex * 3] = centroid.x;
        centroids[triangleIndex * 3 + 1] = centroid.y;
        centroids[triangleIndex * 3 + 2] = centroid.z;

        directions[triangleIndex * 3] = direction.x;
        directions[triangleIndex * 3 + 1] = direction.y;
        directions[triangleIndex * 3 + 2] = direction.z;

        sizes[triangleIndex] = (edge1 + edge2 + edge3) / 3;
      }

      dataByMesh.set(child, {
        centroids,
        directions,
        sizes,
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

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if (!material) return;
          material.wireframe = true;
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

  // Animation loop for face separation
  useFrame((state, delta) => {
    progressRef.current = THREE.MathUtils.damp(
      progressRef.current,
      isHovered ? 1 : 0,
      isHovered ? 8 : 3,
      delta
    );

    meshesRef.current.forEach((mesh) => {
      if (!mesh.geometry || !originalGeometriesRef.current.has(mesh)) return;

      const originalGeometry = originalGeometriesRef.current.get(mesh);
      const positionAttribute = originalGeometry.attributes.position;
      if (!positionAttribute) return;

      // Clone position for modification
      mesh.geometry.attributes.position.array.set(positionAttribute.array);

      const positionArray = mesh.geometry.attributes.position.array;
      const triangleCount = positionAttribute.count / 3;
      const cursor = cursorPosition?.current ?? null;
      const triangleData = triangleDataRef.get(mesh);

      if (!triangleData) return;

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
        const triangleSize = triangleData.sizes[i];

        const cursorInfluence = cursor
          ? THREE.MathUtils.clamp(
              1 - cursor.distanceTo(new THREE.Vector3(centroidX, centroidY, centroidZ)) / touchRadius,
              0,
              1
            )
          : 0;
        const wiggleAmount = cursorInfluence * Math.sin(state.clock.elapsedTime * 14 + i * 0.35) * 0.015;

        // Keep triangles in place; only allow local motion from the cursor
        const separation = triangleGap * 0;
        const shrink = 1;

        // Move all 3 vertices of the triangle in the same direction
        [
          { idx: idx0 },
          { idx: idx1 },
          { idx: idx2 },
        ].forEach(({ idx, origV }) => {
          const vertexOffset = idx * 3;
          const originalX = positionAttribute.array[vertexOffset];
          const originalY = positionAttribute.array[vertexOffset + 1];
          const originalZ = positionAttribute.array[vertexOffset + 2];

          const centeredX = centroidX + (originalX - centroidX) * shrink;
          const centeredY = centroidY + (originalY - centroidY) * shrink;
          const centeredZ = centroidZ + (originalZ - centroidZ) * shrink;

          const newPosX = centeredX + directionX * wiggleAmount;
          const newPosY = centeredY + directionY * wiggleAmount;
          const newPosZ = centeredZ + directionZ * wiggleAmount;

          positionArray[vertexOffset] = newPosX;
          positionArray[vertexOffset + 1] = newPosY;
          positionArray[vertexOffset + 2] = newPosZ;
        });
      }

      mesh.geometry.attributes.position.needsUpdate = true;
    });
  });

  return (
    <group {...groupProps}>
      <primitive
        object={scene}
        castShadow
        receiveShadow
        onPointerOver={(event) => {
          event.stopPropagation();
          setIsHovered(true);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          setIsHovered(false);
        }}
        onClick={(event) => {
          event.stopPropagation();
          console.log("Angel model clicked");
        }}
      />
    </group>
  );
}

// Required for caching
useGLTF.preload("./models/angel.glb");
