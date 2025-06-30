// components/GameMap.tsx
import React from "react";
import { ResourceType, TerrainType, type Tile } from "./types/mapTypes";

interface GameMapProps {
  viewportTiles: number[];
  tileMap: Tile[];
  path: number[];
  currentPathIndex: number;
  targetTile: number | null;
  playerPosition: number | null;
  viewportWidth: number;
  viewportHeight: number;
  onTileClick: (tileId: number) => void;
  getTileColor: (type: TerrainType) => string;
  renderResource: (resource: ResourceType) => React.ReactNode;
}

export const MapView: React.FC<GameMapProps> = ({
  viewportTiles,
  tileMap,
  path,
  currentPathIndex,
  targetTile,
  playerPosition,
  viewportWidth,
  viewportHeight,
  onTileClick,
  getTileColor,
  renderResource,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${viewportWidth}, 40px)`,
        gridTemplateRows: `repeat(${viewportHeight}, 40px)`,
        border: "2px solid #333",
        marginBottom: "20px",
      }}
    >
      {viewportTiles.map((tileId) => {
        const tile = tileMap[tileId];
        if (!tile) return null;

        const tileIndexInPath = path.indexOf(tileId);
        const isOnPath = tileIndexInPath !== -1;
        const isFuturePath = isOnPath && tileIndexInPath >= currentPathIndex;

        return (
          <div
            key={tileId}
            onClick={() => onTileClick(tileId)}
            style={{
              width: "40px",
              height: "40px",
              border: "1px solid #555",
              backgroundColor: getTileColor(tile.type),
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              boxShadow: isFuturePath ? "inset 0 0 0 2px purple" : "none",
              borderColor:
                targetTile === tileId
                  ? "red"
                  : playerPosition === tileId
                  ? "yellow"
                  : "#555",
              borderWidth:
                targetTile === tileId || playerPosition === tileId
                  ? "2px"
                  : "1px",
            }}
          >
            {playerPosition === tileId && (
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "blue",
                  position: "absolute",
                }}
              />
            )}
            {tile.resource !== ResourceType.None &&
              renderResource(tile.resource)}
          </div>
        );
      })}
    </div>
  );
};
