import { useGLTF } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Model(props) {
  const { scene } = useGLTF("./models/angel.glb");
  const [isHovered, setIsHovered] = useState(false);
  const separationDistance = props.separationDistance ?? 0.12;
  const triangleGap = props.triangleGap ?? 0.03;
  const groupProps = { ...props };
  delete groupProps.separationDistance;
  delete groupProps.triangleGap;

  const meshesRef = useRef([]);
  const originalGeometriesRef = useRef(new Map());
  const progressRef = useRef(0);

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
      const indexAttribute = originalGeometry.index;

      if (!positionAttribute) return;

      // Clone position for modification
      mesh.geometry.attributes.position.array.set(positionAttribute.array);

      const positionArray = mesh.geometry.attributes.position.array;
      const triangleCount = positionAttribute.count / 3;

      // Calculate model center
      const modelCenter = new THREE.Vector3();
      let vertexCount = 0;
      for (let i = 0; i < positionAttribute.count; i++) {
        modelCenter.x += positionAttribute.getX(i);
        modelCenter.y += positionAttribute.getY(i);
        modelCenter.z += positionAttribute.getZ(i);
        vertexCount++;
      }
      modelCenter.multiplyScalar(1 / vertexCount);

      for (let i = 0; i < triangleCount; i++) {
        const idx0 = i * 3;
        const idx1 = i * 3 + 1;
        const idx2 = i * 3 + 2;

        // Get original vertex positions
        const origV0 = new THREE.Vector3(
          originalGeometry.attributes.position.array[idx0 * 3],
          originalGeometry.attributes.position.array[idx0 * 3 + 1],
          originalGeometry.attributes.position.array[idx0 * 3 + 2]
        );
        const origV1 = new THREE.Vector3(
          originalGeometry.attributes.position.array[idx1 * 3],
          originalGeometry.attributes.position.array[idx1 * 3 + 1],
          originalGeometry.attributes.position.array[idx1 * 3 + 2]
        );
        const origV2 = new THREE.Vector3(
          originalGeometry.attributes.position.array[idx2 * 3],
          originalGeometry.attributes.position.array[idx2 * 3 + 1],
          originalGeometry.attributes.position.array[idx2 * 3 + 2]
        );

        // Calculate triangle centroid
        const triangleCentroid = new THREE.Vector3()
          .copy(origV0)
          .add(origV1)
          .add(origV2)
          .multiplyScalar(1 / 3);

        // Calculate triangle size (average edge length)
        const edge1 = new THREE.Vector3().copy(origV1).sub(origV0).length();
        const edge2 = new THREE.Vector3().copy(origV2).sub(origV1).length();
        const edge3 = new THREE.Vector3().copy(origV0).sub(origV2).length();
        const triangleSize = (edge1 + edge2 + edge3) / 3;

        // Direction from model center to triangle centroid
        const direction = new THREE.Vector3()
          .copy(triangleCentroid)
          .sub(modelCenter)
          .normalize();

        // Separation amount with gap to prevent overlap
        const separation = Math.min(
          (separationDistance + triangleGap + triangleSize * 0.15) * progressRef.current,
          0.18
        );
        const shrink = 1 - 0.04 * progressRef.current;

        // Move all 3 vertices of the triangle in the same direction
        [
          { idx: idx0, origV: origV0 },
          { idx: idx1, origV: origV1 },
          { idx: idx2, origV: origV2 },
        ].forEach(({ idx, origV }) => {
          const centered = new THREE.Vector3()
            .copy(origV)
            .sub(triangleCentroid)
            .multiplyScalar(shrink)
            .add(triangleCentroid);
          const offset = new THREE.Vector3().copy(direction).multiplyScalar(separation);
          const newPos = centered.add(offset);

          positionArray[idx * 3] = newPos.x;
          positionArray[idx * 3 + 1] = newPos.y;
          positionArray[idx * 3 + 2] = newPos.z;
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
