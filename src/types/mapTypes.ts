export enum TerrainType {
  Grass = "grass",
  Sand = "sand",
  Water = "water",
  Mountain = "mountain",
}

export enum ResourceType {
  None = "none",
  Wood = "wood",
  Stone = "stone",
  Sulfur = "sulfur",
}

export type Tile = {
  id: number;
  type: TerrainType;
  resource: ResourceType;
};
