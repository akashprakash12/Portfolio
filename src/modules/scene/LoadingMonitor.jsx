import { useProgress } from "@react-three/drei";
import { useEffect } from "react";

export default function LoadingMonitor({ onProgress, onLoaded }) {
  const { progress } = useProgress();

  useEffect(() => {
    if (typeof onProgress === "function") onProgress(Math.round(progress));
  }, [progress, onProgress]);

  useEffect(() => {
    if (progress >= 100 && typeof onLoaded === "function") onLoaded();
  }, [progress, onLoaded]);

  return null;
}
