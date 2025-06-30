import { useState, useEffect, useRef } from "react";
import { useMapInitializer } from "./hooks/useInitMap";
import { useViewportTiles } from "./hooks/useVieportTiles";
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { useAutoViewportScroll } from "./hooks/useVieportScroll";
import { MapView } from "./MapView";
import { GameInterface } from "./gameInterface";
import {
  getTileColor,
  renderResource,
  collectResource,
  handleTileClick,
  startMovement,
} from "./utils/utils";

const Map = () => {
  // Ustawienia mapy
  const fullMapHeight = 64;
  const fullMapWidth = 64;

  // Rozmiar widocznego obszaru
  const viewportHeight = 20;
  const viewportWidth = 20;

  // Stan aplikacji

  const [path, setPath] = useState<number[]>([]);
  const [targetTile, setTargetTile] = useState<number | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [resources, setResources] = useState({ wood: 0, stone: 0, sulfur: 0 });
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

  // W komponencie Map dodaj:
  useAutoViewportScroll(
    playerPosition,
    viewportPosition,
    setViewportPosition,
    viewportWidth,
    viewportHeight,
    fullMapWidth,
    fullMapHeight,
    getColumnFromId,
    getRowFromId,
    isMoving
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

  const onTileClick = (tileId: number) => {
    handleTileClick(
      tileId,
      playerPosition,
      isMoving,
      tileMap,
      targetTile,
      setPath,
      setTargetTile,
      handleStartMovement,
      fullMapHeight,
      fullMapWidth
    );
  };

  const handleStartMovement = (resourceTile: number | null) => {
    startMovement(
      path,
      playerPosition,
      setPlayerPosition,
      setPath,
      setTargetTile,
      setIsMoving,
      setCurrentPathIndex,
      resourceTile,
      tileMap,
      handleCollectResource,
      viewportPosition,
      setViewportPosition,
      viewportWidth,
      viewportHeight,
      fullMapWidth,
      fullMapHeight,
      getColumnFromId,
      getRowFromId,
      intervalRef
    );
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
    <div style={{ fontFamily: "Arial, sans-serif", marginLeft: "20px" }}>
      <GameInterface
        playerPosition={playerPosition}
        resources={resources}
        getColumnFromId={getColumnFromId}
        getRowFromId={getRowFromId}
      />
      <MapView
        viewportTiles={viewportTiles}
        tileMap={tileMap}
        path={path}
        currentPathIndex={currentPathIndex}
        targetTile={targetTile}
        playerPosition={playerPosition}
        viewportWidth={viewportWidth}
        viewportHeight={viewportHeight}
        onTileClick={onTileClick}
        getTileColor={getTileColor}
        renderResource={renderResource}
      />
    </div>
  );
};

export default Map;
