import { useEffect } from "react";
import * as THREE from "three";

export default function LoadingMonitor({ onProgress, onLoaded }) {
  useEffect(() => {
    const manager = THREE.DefaultLoadingManager;

    const handleProgress = (url, itemsLoaded, itemsTotal) => {
      if (!itemsTotal) return;
      const p = Math.round((itemsLoaded / itemsTotal) * 100);
      if (typeof onProgress === "function") onProgress(p);
    };

    const handleLoad = () => {
      if (typeof onProgress === "function") onProgress(100);
      if (typeof onLoaded === "function") onLoaded();
    };

    // Attach handlers
    manager.onProgress = handleProgress;
    const prevOnLoad = manager.onLoad;
    manager.onLoad = () => {
      handleLoad();
      if (typeof prevOnLoad === "function") prevOnLoad();
    };

    return () => {
      // Clean up: restore previous handlers
      manager.onProgress = null;
      manager.onLoad = prevOnLoad || null;
    };
  }, [onProgress, onLoaded]);

  return null;
}
