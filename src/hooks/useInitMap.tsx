// hooks/useMapInitializer.ts
import { useState, useEffect } from "react";
import { useMapGenerator } from "./useMapGenerator";
import { TerrainType, ResourceType, type Tile } from "../types/mapTypes";

export const useMapInitializer = (
  fullMapWidth: number,
  fullMapHeight: number,
  viewportWidth: number,
  viewportHeight: number
) => {
  const { generateMap, getRowFromId, getColumnFromId } = useMapGenerator(
    fullMapWidth,
    fullMapHeight
  );

  const [tileMap, setTileMap] = useState<Tile[]>([]);
  const [playerPosition, setPlayerPosition] = useState<number | null>(null);
  const [viewportPosition, setViewportPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const tiles = generateMap();
    setTileMap(tiles);

    // Find valid starting position for player
    let startPos: number;
    const fullMapSize = fullMapHeight * fullMapWidth;
    do {
      startPos = Math.floor(Math.random() * fullMapSize);
    } while (
      tiles[startPos].type === TerrainType.Water ||
      tiles[startPos].type === TerrainType.Mountain ||
      tiles[startPos].resource !== ResourceType.None
    );

    setPlayerPosition(startPos);

    // Center viewport on player
    const startX = Math.max(
      0,
      Math.min(
        getColumnFromId(startPos) - Math.floor(viewportWidth / 2),
        fullMapWidth - viewportWidth
      )
    );

    const startY = Math.max(
      0,
      Math.min(
        getRowFromId(startPos) - Math.floor(viewportHeight / 2),
        fullMapHeight - viewportHeight
      )
    );

    setViewportPosition({ x: startX, y: startY });
  }, []);

  return {
    tileMap,
    setTileMap,
    playerPosition,
    setPlayerPosition,
    viewportPosition,
    setViewportPosition,
    getRowFromId,
    getColumnFromId,
  };
};
