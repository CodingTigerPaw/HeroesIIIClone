import React, { useState, useEffect, useRef } from "react";
import { useMapInitializer } from "./hooks/useInitMap";
import { useViewportTiles } from "./hooks/useVieportTiles";
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { TerrainType, ResourceType } from "./types/mapTypes";
import {
  findPath,
  findPathToResource,
  getTileColor,
  renderResource,
  collectResource,
} from "./utils/utils";

const Map = () => {
  // Ustawienia mapy
  const fullMapHeight = 30;
  const fullMapWidth = 30;

  // Rozmiar widocznego obszaru
  const viewportHeight = 10;
  const viewportWidth = 10;

  // Użycie hooka do generowania mapy

  // Stan aplikacji

  const [path, setPath] = useState<number[]>([]);
  const [targetTile, setTargetTile] = useState<number | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [resources, setResources] = useState({ wood: 0, stone: 0 });
  const [currentPathIndex, setCurrentPathIndex] = useState(0);

  const intervalRef = useRef<number | null>(null);

  // map init
  const {
    tileMap,
    setTileMap,
    playerPosition,
    setPlayerPosition,
    viewportPosition,
    setViewportPosition,
    getRowFromId,
    getColumnFromId,
  } = useMapInitializer(
    fullMapWidth,
    fullMapHeight,
    viewportWidth,
    viewportHeight
  );

  const viewportTiles = useViewportTiles(
    playerPosition,
    viewportPosition,
    viewportWidth,
    viewportHeight,
    fullMapWidth,
    fullMapHeight
  );

  useKeyboardControls(
    isMoving,
    viewportPosition,
    setViewportPosition,
    viewportWidth,
    viewportHeight,
    fullMapWidth,
    fullMapHeight
  );

  const handleCollectResource = (resourceTile: number) => {
    collectResource(resourceTile, tileMap, setTileMap, setResources);
  };
  const handleTileClick = (tileId: number) => {
    if (playerPosition === null || isMoving || !tileMap[tileId]) return;

    // Kliknięcie w niedostępny teren
    if (
      tileMap[tileId].type === TerrainType.Water ||
      tileMap[tileId].type === TerrainType.Mountain
    ) {
      setPath([]);
      setTargetTile(null);
      return;
    }

    // Jeśli kliknięto w zasób
    if (tileMap[tileId].resource !== ResourceType.None) {
      if (targetTile === tileId) {
        // Drugie kliknięcie w zasób - rozpocznij ruch
        const newPath = findPathToResource(
          playerPosition,
          tileId,
          fullMapHeight,
          fullMapWidth,
          tileMap,
          targetTile
        );
        if (newPath.length > 0) {
          setPath(newPath);
          startMovement(tileId);
        }
      } else {
        // Pierwsze kliknięcie w zasób - wyznacz ścieżkę
        const newPath = findPathToResource(
          playerPosition,
          tileId,
          fullMapHeight,
          fullMapWidth,
          tileMap,
          targetTile
        );
        if (newPath.length > 0) {
          setPath(newPath);
          setTargetTile(tileId);
        }
      }
      return;
    }

    // Normalne kliknięcie (bez zasobu)
    if (targetTile === null) {
      const newPath = findPath(
        playerPosition,
        tileId,
        fullMapHeight,
        fullMapWidth,
        tileMap,
        targetTile
      );
      if (newPath.length > 0) {
        setPath(newPath);
        setTargetTile(tileId);
      }
    } else if (targetTile === tileId) {
      startMovement(null);
    } else {
      const newPath = findPath(
        playerPosition,
        tileId,
        fullMapHeight,
        fullMapWidth,
        tileMap,
        targetTile
      );
      if (newPath.length > 0) {
        setPath(newPath);
        setTargetTile(tileId);
      } else {
        setPath([]);
        setTargetTile(null);
      }
    }
  };

  const startMovement = (resourceTile: number | null) => {
    if (path.length < 1 || playerPosition === null) {
      setPath([]);
      setTargetTile(null);
      return;
    }

    setIsMoving(true);
    setCurrentPathIndex(0);

    intervalRef.current = setInterval(() => {
      setCurrentPathIndex((prev) => {
        const newIndex = prev + 1;

        if (newIndex >= path.length) {
          // Koniec ścieżki
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setIsMoving(false);

          if (
            resourceTile !== null &&
            tileMap[resourceTile]?.resource !== ResourceType.None
          ) {
            handleCollectResource(resourceTile);
          }

          setPath([]);
          setTargetTile(null);
          return 0;
        }

        const newPosition = path[newIndex];
        setPlayerPosition(newPosition);

        // Przesuń widok
        const playerCol = getColumnFromId(newPosition);
        const playerRow = getRowFromId(newPosition);

        let newViewportX = viewportPosition.x;
        let newViewportY = viewportPosition.y;

        if (playerCol < viewportPosition.x) {
          newViewportX = playerCol;
        } else if (playerCol >= viewportPosition.x + viewportWidth) {
          newViewportX = playerCol - viewportWidth + 1;
        }

        if (playerRow < viewportPosition.y) {
          newViewportY = playerRow;
        } else if (playerRow >= viewportPosition.y + viewportHeight) {
          newViewportY = playerRow - viewportHeight + 1;
        }

        if (
          newViewportX !== viewportPosition.x ||
          newViewportY !== viewportPosition.y
        ) {
          setViewportPosition({
            x: Math.max(
              0,
              Math.min(newViewportX, fullMapWidth - viewportWidth)
            ),
            y: Math.max(
              0,
              Math.min(newViewportY, fullMapHeight - viewportHeight)
            ),
          });
        }

        return newIndex;
      });
    }, 300);
  };

  // Czyszczenie interwału
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <h2>Heroes III Clone</h2>
      <div style={{ marginBottom: "10px" }}>
        <p>
          Click to select path, click again to move. Click resource once to
          select, again to collect.
        </p>
        <p>
          Player position:{" "}
          {playerPosition !== null
            ? `(${getColumnFromId(playerPosition)}, ${getRowFromId(
                playerPosition
              )})`
            : "..."}
        </p>
        <p>
          Resources: Wood: {resources.wood}, Stone: {resources.stone}
        </p>
      </div>

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
              onClick={() => handleTileClick(tileId)}
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
    </div>
  );
};

export default Map;
