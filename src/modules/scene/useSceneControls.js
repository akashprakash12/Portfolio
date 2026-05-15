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
      windowColor: { value: "#FFFF00" },
      windowRayCount: { value: 3, min: 0, max: 8, step: 1 },
      windowRayOpacity: { value: 0.3, min: 0, max: 1, step: 0.01 },
      windowRayLength: { value: 6, min: 0.1, max: 20, step: 0.1 },
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
  };
}