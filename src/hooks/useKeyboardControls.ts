// hooks/useKeyboardControls.ts
import { useEffect } from "react";

export const useKeyboardControls = (
  isMoving: boolean,
  viewportPosition: { x: number; y: number },
  setViewportPosition: (position: { x: number; y: number }) => void,
  viewportWidth: number,
  viewportHeight: number,
  fullMapWidth: number,
  fullMapHeight: number
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMoving) return;

      const moveAmount = 1;
      let newX = viewportPosition.x;
      let newY = viewportPosition.y;

      switch (e.key.toLowerCase()) {
        case "w":
          newY = Math.max(0, viewportPosition.y - moveAmount);
          break;
        case "s":
          newY = Math.min(
            fullMapHeight - viewportHeight,
            viewportPosition.y + moveAmount
          );
          break;
        case "a":
          newX = Math.max(0, viewportPosition.x - moveAmount);
          break;
        case "d":
          newX = Math.min(
            fullMapWidth - viewportWidth,
            viewportPosition.x + moveAmount
          );
          break;
        default:
          return;
      }

      if (newX !== viewportPosition.x || newY !== viewportPosition.y) {
        setViewportPosition({ x: newX, y: newY });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isMoving,
    viewportPosition,
    setViewportPosition,
    viewportWidth,
    viewportHeight,
    fullMapWidth,
    fullMapHeight,
  ]);
};
