import { TerrainType, ResourceType, type Tile } from "../types/mapTypes";
export const useMapGenerator = (mapWidth: number, mapHeight: number) => {
  const generateMap = (): Tile[] => {
    const mapSize = mapWidth * mapHeight;
    const tiles: Tile[] = Array.from({ length: mapSize }, (_, i) => ({
      id: i,
      type: TerrainType.Grass,
      resource: ResourceType.None,
    }));

    // Generowanie terenu
    tiles.forEach((tile) => {
      if (Math.random() < 0.03) {
        tile.type = TerrainType.Water;
      } else if (Math.random() < 0.02) {
        tile.type = TerrainType.Mountain;
      }
    });

    // Rozprzestrzenianie wody
    for (let i = 0; i < 4; i++) {
      tiles.forEach((tile) => {
        if (tile.type === TerrainType.Grass) {
          const neighbors = getNeighbors(tile.id, mapWidth, mapHeight);
          const waterNeighbors = neighbors.filter(
            (id) => tiles[id].type === TerrainType.Water
          ).length;
          if (Math.random() < waterNeighbors * 0.3) {
            tile.type = TerrainType.Water;
          }
        }
      });
    }

    // Generowanie piasku
    tiles.forEach((tile) => {
      if (tile.type === TerrainType.Grass && Math.random() < 0.2) {
        tile.type = TerrainType.Sand;
      }
    });

    // Generowanie zasobów
    tiles.forEach((tile) => {
      if (tile.type === TerrainType.Grass || tile.type === TerrainType.Sand) {
        const rand = Math.random();
        if (rand < 0.04) {
          tile.resource = ResourceType.Wood;
        } else if (rand < 0.08) {
          tile.resource = ResourceType.Stone;
        }
      }
    });

    return tiles;
  };

  const getRowFromId = (id: number): number => Math.floor(id / mapWidth);
  const getColumnFromId = (id: number): number => id % mapWidth;
  const getIdFromCoords = (x: number, y: number): number => y * mapWidth + x;

  const getNeighbors = (
    id: number,
    width: number,
    height: number
  ): number[] => {
    const neighbors: number[] = [];
    const row = getRowFromId(id);
    const col = getColumnFromId(id);

    const directions = [
      { x: col, y: row - 1 }, // góra
      { x: col, y: row + 1 }, // dół
      { x: col - 1, y: row }, // lewo
      { x: col + 1, y: row }, // prawo
    ];

    directions.forEach((dir) => {
      if (dir.x >= 0 && dir.x < width && dir.y >= 0 && dir.y < height) {
        neighbors.push(getIdFromCoords(dir.x, dir.y));
      }
    });

    return neighbors;
  };

  return {
    generateMap,
    getRowFromId,
    getColumnFromId,
    getIdFromCoords,
    getNeighbors,
    TerrainType,
    ResourceType,
  };
};
