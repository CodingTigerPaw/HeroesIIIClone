// useViewportTiles.ts
import { useEffect, useState } from "react";

export const useViewportTiles = (
  playerPosition: number | null,
  viewportPosition: { x: number; y: number },
  viewportWidth: number,
  viewportHeight: number,
  fullMapWidth: number,
  fullMapHeight: number
) => {
  const [viewportTiles, setViewportTiles] = useState<number[]>([]);

  useEffect(() => {
    if (playerPosition === null) return;

    const visibleTiles: number[] = [];
    for (let y = 0; y < viewportHeight; y++) {
      for (let x = 0; x < viewportWidth; x++) {
        const mapX = viewportPosition.x + x;
        const mapY = viewportPosition.y + y;

        if (
          mapX >= 0 &&
          mapX < fullMapWidth &&
          mapY >= 0 &&
          mapY < fullMapHeight
        ) {
          const tileId = mapY * fullMapWidth + mapX;
          visibleTiles.push(tileId);
        }
      }
    }
    setViewportTiles(visibleTiles);
  }, [
    viewportPosition,
    playerPosition,
    viewportWidth,
    viewportHeight,
    fullMapWidth,
    fullMapHeight,
  ]);

  return viewportTiles;
};
