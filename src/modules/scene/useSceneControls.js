import { useControls } from "leva";

// Centralized scene controls so the model, cursor, and hover tuning stay in one place.
export function useSceneControls() {
  const { position, rotation, scale } = useControls({
    position: { value: [1.9, -2.3, 1.3], step: 0.1 },
    rotation: { value: [0.05, -0.16, 0], step: 0.01 },
    scale: { value: 0.1, min: 0.1, max: 5 },
  });

  const { triangleGap, scatterIntensity } = useControls("Hover Effects", {
    triangleGap: { value: 0.08, min: 0, max: 0.5, step: 0.02 },
    scatterIntensity: { value: 0.35, min: 0, max: 1, step: 0.05 },
  });

  const { touchRadius } = useControls("Cursor Settings", {
    touchRadius: { value: 0.4, min: 0.1, max: 2, step: 0.05 },
  });

  return {
    position,
    rotation,
    scale,
    triangleGap,
    scatterIntensity,
    touchRadius,
  };
}