import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Model(props) {
  const { scene } = useGLTF("./models/angel.glb");
  const [isHovered, setIsHovered] = useState(false);
  const particleSize = props.particleSize ?? 0.03;
  const particleSpread = props.particleSpread ?? 0.22;
  const particleSpeed = props.particleSpeed ?? 0.32;
  const particleWobble = props.particleWobble ?? 0.01;
  const particleGap = props.particleGap ?? 0.08;
  const groupProps = { ...props };

  delete groupProps.particleSize;
  delete groupProps.particleSpread;
  delete groupProps.particleSpeed;
  delete groupProps.particleWobble;
  delete groupProps.particleGap;

  const particlesGeometryRef = useRef(null);
  const particlesMaterialRef = useRef(null);
  const progressRef = useRef(0);
  const hoverTargetRef = useRef(0);
  const hoverTimeRef = useRef(0);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if (!material) return;
          material.wireframe = true;
          material.needsUpdate = true;

          // Important for soft shadows
          material.shadowSide = 2;
        });
      }
    });
  }, [scene]);

  const particleData = useMemo(() => {
    const basePositions = [];
    const directions = [];
    const speeds = [];
    const offsets = [];

    const modelCenter = new THREE.Vector3();
    new THREE.Box3().setFromObject(scene).getCenter(modelCenter);

    const triangleCentroid = new THREE.Vector3();
    const vertexA = new THREE.Vector3();
    const vertexB = new THREE.Vector3();
    const vertexC = new THREE.Vector3();

    let triangleIndex = 0;

    scene.traverse((child) => {
      if (!child.isMesh || !child.geometry) return;

      const geometry = child.geometry;
      const positionAttribute = geometry.attributes.position;
      const indexAttribute = geometry.index;

      if (!positionAttribute) return;

      const triangleCount = indexAttribute
        ? indexAttribute.count / 3
        : positionAttribute.count / 3;

      const sampleStep = Math.max(1, Math.floor(triangleCount / 800));

      for (let faceIndex = 0; faceIndex < triangleCount; faceIndex += sampleStep) {
        const aIndex = indexAttribute ? indexAttribute.getX(faceIndex * 3) : faceIndex * 3;
        const bIndex = indexAttribute ? indexAttribute.getX(faceIndex * 3 + 1) : faceIndex * 3 + 1;
        const cIndex = indexAttribute ? indexAttribute.getX(faceIndex * 3 + 2) : faceIndex * 3 + 2;

        vertexA.fromBufferAttribute(positionAttribute, aIndex);
        vertexB.fromBufferAttribute(positionAttribute, bIndex);
        vertexC.fromBufferAttribute(positionAttribute, cIndex);

        triangleCentroid
          .copy(vertexA)
          .add(vertexB)
          .add(vertexC)
          .multiplyScalar(1 / 3);

        const edgeAB = vertexB.clone().sub(vertexA);
        const edgeAC = vertexC.clone().sub(vertexA);
        const normal = new THREE.Vector3().crossVectors(edgeAB, edgeAC).normalize();
        const centerDirection = triangleCentroid.clone().sub(modelCenter);
        const fallbackDirection = new THREE.Vector3(0, 1, 0);

        if (!Number.isFinite(normal.x) || normal.lengthSq() === 0) {
          normal.copy(fallbackDirection);
        }

        if (normal.dot(centerDirection) < 0) {
          normal.multiplyScalar(-1);
        }

        basePositions.push(triangleCentroid.x, triangleCentroid.y, triangleCentroid.z);
        directions.push(normal.x, normal.y, normal.z);
        speeds.push(0.5 + Math.random() * 1.5);
        offsets.push(Math.random() * Math.PI * 2 + triangleIndex * 0.01);
        triangleIndex += 1;
      }
    });

    return {
      basePositions: new Float32Array(basePositions),
      directions: new Float32Array(directions),
      speeds: new Float32Array(speeds),
      offsets: new Float32Array(offsets),
    };
  }, [scene]);

  useFrame((state, delta) => {
    hoverTargetRef.current = isHovered ? 1 : 0;
    if (isHovered) {
      hoverTimeRef.current += delta;
    }

    progressRef.current = THREE.MathUtils.damp(
      progressRef.current,
      hoverTargetRef.current,
      isHovered ? 8 : 3,
      delta
    );

    const geometry = particlesGeometryRef.current;
    if (!geometry) return;

    const positionAttribute = geometry.attributes.position;
    if (!positionAttribute) return;

    if (particlesMaterialRef.current) {
      particlesMaterialRef.current.opacity = progressRef.current;
    }

    const elapsedTime = state.clock.elapsedTime;
    const spread = particleGap + particleSpread * progressRef.current;
    const positionArray = positionAttribute.array;

    for (let index = 0; index < particleData.basePositions.length / 3; index += 1) {
      const baseIndex = index * 3;
      const directionIndex = baseIndex;

      const spin = hoverTimeRef.current * particleSpeed * particleData.speeds[index] * 2.2;
      const pulse = Math.sin(elapsedTime * particleSpeed * particleData.speeds[index] + particleData.offsets[index]) * particleWobble * progressRef.current;
      const shellOffset = Math.min(particleSpread, spread + pulse);

      positionArray[baseIndex] =
        particleData.basePositions[baseIndex] +
        particleData.directions[directionIndex] * shellOffset;
      positionArray[baseIndex + 1] =
        particleData.basePositions[baseIndex + 1] +
        particleData.directions[directionIndex + 1] * shellOffset;
      positionArray[baseIndex + 2] =
        particleData.basePositions[baseIndex + 2] +
        particleData.directions[directionIndex + 2] * shellOffset;
    }

    positionAttribute.needsUpdate = true;
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

      <points visible={progressRef.current > 0.01 || isHovered}>
        <bufferGeometry ref={particlesGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData.basePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={particlesMaterialRef}
          color="#f8fbff"
          size={particleSize}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// Required for caching
useGLTF.preload("./models/angel.glb");
