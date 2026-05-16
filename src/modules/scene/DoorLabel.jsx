import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneControls } from "./useSceneControls";

export default function DoorLabel({ targetNames = ["doore", "porte001"] }) {
  const { scene, camera } = useThree();
  const { doorLabelOffset } = useSceneControls();
  const spriteRef = useRef();
  const texRef = useRef();
  const targetRef = useRef(null);

  // create canvas texture for label (text + arrow)
  const texture = useMemo(() => {
    const size = 512; // larger canvas for cleaner, bigger text
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // transparent background
    ctx.clearRect(0, 0, size, size);

    // rounded rect for label
    const pad = 28;
    ctx.fillStyle = "rgba(20,20,20,0.85)";
    const w = size - pad * 2;
    const h = 140;
    const x = pad;
    const y = pad;
    const r = 18;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();

    // text
    ctx.fillStyle = "#ffd6e8"; // soft pink for "Open"
    ctx.font = "bold 64px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Open", size / 2, y + h / 2 - 12);

    // arrow (triangle) below label pointing down
    ctx.fillStyle = "rgba(20,20,20,0.9)";
    ctx.beginPath();
    const ax = size / 2;
    const ay = y + h + 20;
    ctx.moveTo(ax - 22, ay);
    ctx.lineTo(ax + 22, ay);
    ctx.lineTo(ax, ay + 32);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    texRef.current = tex;
    return tex;
  }, []);

  useEffect(() => {
    // find the first matching target object in the scene
    for (const name of targetNames) {
      const found = scene.getObjectByName(name);
      if (found) {
        targetRef.current = found;
        break;
      }
    }
    // fallback: traverse to find an object name including door/porte
    if (!targetRef.current) {
      scene.traverse((obj) => {
        const n = (obj.name || "").toLowerCase();
        if (!targetRef.current && (n.includes("door") || n.includes("porte") || n === "doore")) {
          targetRef.current = obj;
        }
      });
    }
  }, [scene, targetNames]);

  useFrame(() => {
    const sprite = spriteRef.current;
    const target = targetRef.current;
    if (!sprite || !target) return;

    // compute a world-aligned bounding box for the target and position the label to its side
    if (!sprite.userData._box) sprite.userData._box = new THREE.Box3();
    const box = sprite.userData._box;
    box.setFromObject(target);

    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);

    // compute the target's right direction in world space
    const worldQuat = new THREE.Quaternion();
    target.getWorldQuaternion(worldQuat);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(worldQuat);

    // offset to the right of the door plus slightly up
    const offset = right.clone().multiplyScalar(size.x / 2 + 0.18);
    offset.y = size.y / 2 - 0.05;

    const finalPos = center.clone().add(offset);

    // apply Leva offset control (allows designer to nudge label)
    if (doorLabelOffset && Array.isArray(doorLabelOffset)) {
      const ctrl = new THREE.Vector3(doorLabelOffset[0], doorLabelOffset[1], doorLabelOffset[2]);
      finalPos.add(ctrl);
    }

    sprite.position.copy(finalPos);

    // face the camera and make sure it's visible on top
    sprite.quaternion.copy(camera.quaternion);
    sprite.renderOrder = 1000;
    if (sprite.material) {
      sprite.material.depthTest = false;
      sprite.material.depthWrite = false;
    }
  });

  return (
    <sprite ref={spriteRef} scale={[8,5, 1]}>
      <spriteMaterial attach="material" map={texture} transparent />
    </sprite>
  );
}
