import { TerrainType, ResourceType, type Tile } from "../types/mapTypes";

export const getNeighbors = (
  id: number,
  width: number,
  height: number
): number[] => {
  const neighbors: number[] = [];
  const row = Math.floor(id / width);
  const col = id % width;

  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];

  for (const [dy, dx] of directions) {
    const newRow = row + dy;
    const newCol = col + dx;
    if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width) {
      neighbors.push(newRow * width + newCol);
    }
  }

  return neighbors;
};

export const getColumnFromId = (id: number, width: number): number =>
  id % width;

export const getRowFromId = (id: number, width: number): number =>
  Math.floor(id / width);

export const getTileColor = (type: TerrainType): string => {
  switch (type) {
    case TerrainType.Grass:
      return "#7CFC00";
    case TerrainType.Sand:
      return "#F0E68C";
    case TerrainType.Water:
      return "#1E90FF";
    case TerrainType.Mountain:
      return "#8B4513";
    default:
      return "#CCCCCC";
  }
};

export const findPath = (
  start: number,
  end: number,

  fullMapHeight: number,
  fullMapWidth: number,
  tileMap: Tile[],
  targetTile: number | undefined
): number[] => {
  if (start === end) return [start];
  if (
    tileMap[end]?.type === TerrainType.Water ||
    tileMap[end]?.type === TerrainType.Mountain ||
    (tileMap[end]?.resource !== ResourceType.None && end !== targetTile)
  ) {
    return [];
  }

  const queue: { position: number; path: number[] }[] = [
    { position: start, path: [start] },
  ];
  const visited = new Set<number>([start]);

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const neighbor of getNeighbors(
      current.position,
      fullMapWidth,
      fullMapHeight
    )) {
      if (
        !visited.has(neighbor) &&
        tileMap[neighbor]?.type !== TerrainType.Water &&
        tileMap[neighbor]?.type !== TerrainType.Mountain &&
        (tileMap[neighbor]?.resource === ResourceType.None ||
          neighbor === targetTile)
      ) {
        if (neighbor === end) {
          return [...current.path, neighbor];
        }
        visited.add(neighbor);
        queue.push({
          position: neighbor,
          path: [...current.path, neighbor],
        });
      }
    }
  }

  return [];
};

export const findPathToResource = (
  start: number,
  resourceTile: number,
  fullMapHeight: number,
  fullMapWidth: number,
  tileMap: Tile[],
  targetTile?: number | undefined
): number[] => {
  const possibleStops = getNeighbors(
    resourceTile,
    fullMapWidth,
    fullMapHeight
  ).filter(
    (neighborId) =>
      tileMap[neighborId]?.type !== TerrainType.Water &&
      tileMap[neighborId]?.type !== TerrainType.Mountain &&
      tileMap[neighborId]?.resource === ResourceType.None
  );

  if (possibleStops.length === 0) return [];

  let shortestPath: number[] = [];
  let shortestLength = Infinity;

  possibleStops.forEach((stopId) => {
    const path = findPath(
      start,
      stopId,
      fullMapHeight,
      fullMapWidth,
      tileMap,
      targetTile
    );
    if (path.length > 0 && path.length < shortestLength) {
      shortestPath = path;
      shortestLength = path.length;
    }
  });

  return shortestPath;
};

export const renderResource = (resource: ResourceType) => {
  switch (resource) {
    case ResourceType.Wood:
      return (
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#8B4513",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      );
    case ResourceType.Stone:
      return (
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#808080",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      );
    case ResourceType.Sulfur:
      return (
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#22a2c9",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        ></div>
      );
    default:
      return null;
  }
};

// utils/collectResource.ts

// export const collectResource = (
//   tileId: number,
//   tileMap: { id: number; resource: ResourceType }[],
//   setTileMap: React.Dispatch<React.SetStateAction<Tile[]>>,
//   //todo
//   setResources: React.Dispatch<
//     React.SetStateAction<{ wood: number; stone: number; sulfur: number }>
//   >
// ) => {
//   const resourceType = tileMap[tileId]?.resource;
//   if (!resourceType || resourceType === ResourceType.None) return;

//   setTileMap((prev) =>
//     prev.map((tile) =>
//       tile.id === tileId ? { ...tile, resource: ResourceType.None } : tile
//     )
//   );

//   setResources((prev) => ({
//     ...prev,
//     [resourceType]: prev[resourceType] + 1,
//   }));
// };

export const collectResource = (
  resourceTile: number,
  tileMap: Tile[],
  setTileMap: (tiles: Tile[]) => void,
  setResources: (resources: any) => void
) => {
  setTileMap(
    tileMap.map((tile) => {
      if (tile.id === resourceTile && tile.resource !== ResourceType.None) {
        setResources((prev: any) => ({
          ...prev,
          [tile.resource]: prev[tile.resource] + 1,
        }));
        return { ...tile, resource: ResourceType.None };
      }
      return tile;
    })
  );
};

// utils/handleTileClick.ts

export const handleTileClick = (
  tileId: number,
  playerPosition: number | null,
  isMoving: boolean,
  tileMap: Tile[],
  targetTile: number | null,
  setPath: React.Dispatch<React.SetStateAction<number[]>>,
  setTargetTile: React.Dispatch<React.SetStateAction<number | null>>,
  startMovement: (resourceTile: number | null) => void,
  fullMapHeight: number,
  fullMapWidth: number
) => {
  if (playerPosition === null || isMoving || !tileMap[tileId]) return;

  // Click on inaccessible terrain
  if (
    tileMap[tileId].type === TerrainType.Water ||
    tileMap[tileId].type === TerrainType.Mountain
  ) {
    setPath([]);
    setTargetTile(null);
    return;
  }

  // If clicked on resource
  if (tileMap[tileId].resource !== ResourceType.None) {
    if (targetTile === tileId) {
      // Second click on resource - start movement
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
      // First click on resource - set path
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

  // Normal click (no resource)
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

// utils/startMovement.ts

export const startMovement = (
  path: number[],
  playerPosition: number | null,
  setPlayerPosition: (position: number) => void,
  setPath: (path: number[]) => void,
  setTargetTile: (tile: number | null) => void,
  setIsMoving: (isMoving: boolean) => void,
  setCurrentPathIndex: (index: number) => void,
  resourceTile: number | null,
  tileMap: { id: number; resource: ResourceType }[],
  collectResource: (tileId: number) => void,
  viewportPosition: { x: number; y: number },
  setViewportPosition: (position: { x: number; y: number }) => void,
  viewportWidth: number,
  viewportHeight: number,
  fullMapWidth: number,
  fullMapHeight: number,
  getColumnFromId: (id: number) => number,
  getRowFromId: (id: number) => number,
  intervalRef: React.MutableRefObject<number | null>
) => {
  if (path.length < 1 || playerPosition === null) {
    setPath([]);
    setTargetTile(null);
    return;
  }

  setIsMoving(true);
  setCurrentPathIndex(0);

  intervalRef.current = window.setInterval(() => {
    setCurrentPathIndex((prev) => {
      const newIndex = prev + 1;

      if (newIndex >= path.length) {
        // End of path
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsMoving(false);

        if (
          resourceTile !== null &&
          tileMap[resourceTile]?.resource !== ResourceType.None
        ) {
          collectResource(resourceTile);
        }

        setPath([]);
        setTargetTile(null);
        return 0;
      }

      const newPosition = path[newIndex];
      setPlayerPosition(newPosition);

      // Move viewport
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
          x: Math.max(0, Math.min(newViewportX, fullMapWidth - viewportWidth)),
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
