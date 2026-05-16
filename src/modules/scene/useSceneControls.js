import { useControls } from "leva";

// Centralized scene controls so the model, cursor, and hover tuning stay in one place.
export function useSceneControls() {
  const { position, rotation, scale } = useControls("Model", {
    position: { value: [1.9, -1, 1.3], step: 0.1 },
    rotation: { value: [0.05, -0.78, 0], step: 0.01 },
    scale: { value: 0.1, min: 0.1, max: 5 },
  });

  const { triangleGap, scatterIntensity } = useControls("Hover Effects", {
    triangleGap: { value: 0.08, min: 0, max: 0.5, step: 0.02 },
    scatterIntensity: { value: 0.35, min: 0, max: 1, step: 0.05 },
  });

  const { touchRadius } = useControls("Cursor Settings", {
    touchRadius: { value: 0.4, min: 0.1, max: 2, step: 0.05 },
  });

  // --- Key Light ---
  const { keyIntensity, keyColor, keyPosition } = useControls("Key Light", {
    keyPosition: { value: [6, 12, 6], step: 0.5 },
    keyIntensity: { value: 1.7, min: 0, max: 5, step: 0.05 },
    keyColor: { value: "#c8d9ff" },
  });

  // --- Fill Light ---
  const { fillIntensity, fillColor, fillPosition, fillDistance } =
    useControls("Fill Light", {
      fillPosition: { value: [-1, 3.5, -2], step: 0.5 },
      fillIntensity: { value: 13.5, min: 0, max: 20, step: 0.5 },
      fillColor: { value: "#ffd3a1" },
      fillDistance: { value: 28, min: 5, max: 100, step: 1 },
    });

  // --- Postprocessing / Bloom ---
  const { bloomIntensity, luminanceThreshold, luminanceSmoothing } =
    useControls("Postprocessing", {
      bloomIntensity: { value: 2.2, min: 0, max: 10, step: 0.1 },
      luminanceThreshold: { value: 0.05, min: 0, max: 1, step: 0.01 },
      luminanceSmoothing: { value: 0.12, min: 0, max: 1, step: 0.01 },
    });

  // --- Window rays / bloom color ---
  const { windowColor, windowRayCount, windowRayOpacity, windowRayLength } =
    useControls("Window Rays", {
      windowColor: { value: "#8fa380" },
      windowRayCount: { value: 3, min: 0, max: 8, step: 1 },
      windowRayOpacity: { value: 0.3, min: 0, max: 1, step: 0.01 },
      windowRayLength: { value: 6, min: 0.1, max: 20, step: 0.1 },
    });

  // --- UI Labels ---
  const { doorLabelOffset } = useControls("UI Labels", {
    doorLabelOffset: { value: [-6.180000000000003, 11.279999999999987, 2.3000000000000007], step: 0.01 },
  });

  // --- Chimney smoke ---
  const {
    smokeEnabled,
    smokeCount,
    smokeSpawnInterval,
    smokeSize,
    smokeLifetime,
    smokeColor,
    smokeBuoyancy,
    smokeOpacity,
  } = useControls("Chimney Smoke", {
    smokeEnabled: { value: true },
    smokeCount: { value: 26, min: 4, max: 200, step: 1 },
    smokeSpawnInterval: { value: 0.23, min: 0.01, max: 1, step: 0.01 },
    smokeSize: { value: [0.02, 0.39], min: 0.001, max: 1, step: 0.001 },
    smokeLifetime: { value: [1, 6.7], min: 0.1, max: 10, step: 0.1 },
    smokeColor: { value: "#897d72" },
    smokeBuoyancy: { value: 1.4, min: 0, max: 2, step: 0.01 },
    smokeOpacity: { value: 0.49, min: 0, max: 1, step: 0.01 },
  });

  return {
    // Model
    position,
    rotation,
    scale,
    // Hover
    triangleGap,
    scatterIntensity,
    // Cursor
    touchRadius,
    // Key light
    keyIntensity,
    keyColor,
    keyPosition,
    // Fill light
    fillIntensity,
    fillColor,
    fillPosition,
    fillDistance,
    // Bloom
    bloomIntensity,
    luminanceThreshold,
    luminanceSmoothing,
    // Window rays
    windowColor,
    windowRayCount,
    windowRayOpacity,
    windowRayLength,
    // UI labels
    doorLabelOffset,
    // smoke
    smokeEnabled,
    smokeCount,
    smokeSpawnInterval,
    smokeSize,
    smokeLifetime,
    smokeColor,
    smokeBuoyancy,
    smokeOpacity,
  };
}