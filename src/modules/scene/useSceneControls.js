import { useControls } from "leva";

const isDev = import.meta.env.DEV;

const readControls = (groupName, schema) => {
  if (!isDev) {
    return Object.fromEntries(
      Object.entries(schema).map(([key, config]) => [
        key,
        Array.isArray(config?.value) ? [...config.value] : config?.value,
      ]),
    );
  }

  return useControls(groupName, schema);
};

// Centralized scene controls so the model, cursor, and hover tuning stay in one place.
export function useSceneControls() {
  const { position, rotation, scale } = readControls("Model", {
    position: { value: [1.9, -1, 1.3], step: 0.1 },
    rotation: { value: [0.05, -0.78, 0], step: 0.01 },
    scale: { value: 0.1, min: 0.1, max: 5 },
  });

  const { triangleGap, scatterIntensity } = readControls("Hover Effects", {
    triangleGap: { value: 0.08, min: 0, max: 0.5, step: 0.02 },
    scatterIntensity: { value: 0.35, min: 0, max: 1, step: 0.05 },
  });

  const { touchRadius } = readControls("Cursor Settings", {
    touchRadius: { value: 0.4, min: 0.1, max: 2, step: 0.05 },
  });

  // --- Key Light ---
  const { keyIntensity, keyColor, keyPosition } = readControls("Key Light", {
    keyPosition: { value: [6, 12, 6], step: 0.5 },
    keyIntensity: { value: 1.7, min: 0, max: 5, step: 0.05 },
    keyColor: { value: "#c8d9ff" },
  });

  // --- Fill Light ---
  const { fillIntensity, fillColor, fillPosition, fillDistance } =
    readControls("Fill Light", {
      fillPosition: { value: [-1, 3.5, -2], step: 0.5 },
      fillIntensity: { value: 13.5, min: 0, max: 20, step: 0.5 },
      fillColor: { value: "#ffd3a1" },
      fillDistance: { value: 28, min: 5, max: 100, step: 1 },
    });

  // --- Postprocessing / Bloom ---
  const { bloomIntensity, luminanceThreshold, luminanceSmoothing } =
    readControls("Postprocessing", {
      bloomIntensity: { value: 2.2, min: 0, max: 10, step: 0.1 },
      luminanceThreshold: { value: 0.05, min: 0, max: 1, step: 0.01 },
      luminanceSmoothing: { value: 0.12, min: 0, max: 1, step: 0.01 },
    });

  // --- Window rays / bloom color ---
  const { windowColor, windowRayCount, windowRayOpacity, windowRayLength } =
    readControls("Window Rays", {
      windowColor: { value: "#8fa380" },
      windowRayCount: { value: 3, min: 0, max: 8, step: 1 },
      windowRayOpacity: { value: 0.3, min: 0, max: 1, step: 0.01 },
      windowRayLength: { value: 6, min: 0.1, max: 20, step: 0.1 },
    });

  // --- Helpers (debug toggle) ---
  const { showLightHelpers } = readControls("Helpers", {
    showLightHelpers: { value: false },
  });

  // --- UI Labels ---
  const { doorLabelOffset } = readControls("UI Labels", {
    doorLabelOffset: { value: [-6.180000000000003, 11.279999999999987, 2.3000000000000007], step: 0.01 },
  });

// --- Mushroom Model ---
const { mushroomPosition, mushroomScale } = readControls("Mushroom Model", {
  mushroomPosition: {
    value: [-4.9, -0.6, 2.2],
    step: 0.1,
  },
  mushroomScale: {
    value: 2,
    min: 0.1,
    max: 5,
    step: 0.05,
  },
});

// --- Banana Model (was Mountains) ---
const { bananaPosition, bananaRotation, bananaScale } = readControls("Banana Model", {
  bananaPosition: {
    value: [-4.2, -0.7, -6],
    step: 0.1,
  },
  bananaRotation: {
    value: [0.01, 0, 0],
    step: 0.01,
  },
  bananaScale: {
    value: 0.03,
    min: 0.03,
    max: 100,
    step: 0.0001,
  },
});

// --- Contact Models ---
const { contactTreePosition, contactTreeScale, contactBoyPosition, contactBoyScale } = readControls("Contact Models", {
  contactTreePosition: {
    value: [-5, -1.65, -1.55],
    step: 0.1,
  },
  contactTreeScale: {
    value: 0.01,
    min: 0.001,
    max: 10,
    step: 0.001,
  },
  contactBoyPosition: {
    value: [-9.4, 2.65, -2.15],
    step: 0.1,
  },
  contactBoyScale: {
    value: 0.08,
    min: 0.001,
    max: 10,
    step: 0.001,
  },
});

  // --- Water ---
  const { waterColor, waveSpeed, waveFreq, waveAmp, waterScale } = readControls(
    "Water",
    {
      waterColor: { value: "#2b6ea3" },
      waveSpeed: { value: 0.6, min: 0, max: 5, step: 0.01 },
      waveFreq: { value: 1.5, min: 0.1, max: 10, step: 0.1 },
      waveAmp: { value: 0.18, min: 0, max: 1, step: 0.01 },
      waterScale: { value: 1, min: 0.1, max: 5, step: 0.01 },
    }
  );
  const {
    waterRoughness,
    waterBlur,
    reflectivity,
    normalScale,
    splashEnabled,
    splashRate,
  } = readControls("Water Extras", {
    waterRoughness: { value: 0.12, min: 0, max: 1, step: 0.01 },
    waterBlur: { value: [100, 200], min: 0, max: 1000, step: 1 },
    reflectivity: { value: 0.6, min: 0, max: 1, step: 0.01 },
    normalScale: { value: 1.2, min: 0, max: 5, step: 0.01 },
    splashEnabled: { value: true },
    splashRate: { value: 0.4, min: 0.01, max: 2, step: 0.01 },
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
  } = readControls("Chimney Smoke", {
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
    // Helpers
    showLightHelpers,
    // Water
    waterColor,
    waveSpeed,
    waveFreq,
    waveAmp,
    waterScale,
    waterRoughness,
    waterBlur,
    reflectivity,
    normalScale,
    splashEnabled,
    splashRate,
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
    // Mushroom
    mushroomPosition,
    mushroomScale,
    // Banana
    bananaPosition,
    bananaRotation,
    bananaScale,
    // Contact models
    contactTreePosition,
    contactTreeScale,
    contactBoyPosition,
    contactBoyScale,
  };
}