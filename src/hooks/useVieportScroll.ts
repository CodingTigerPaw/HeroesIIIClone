// hooks/useAutoViewportScroll.ts
import { useEffect } from "react";

export const useAutoViewportScroll = (
  playerPosition: number | null,
  viewportPosition: { x: number; y: number },
  setViewportPosition: (position: { x: number; y: number }) => void,
  viewportWidth: number,
  viewportHeight: number,
  fullMapWidth: number,
  fullMapHeight: number,
  getColumnFromId: (id: number) => number,
  getRowFromId: (id: number) => number,
  isMoving: boolean
) => {
  useEffect(() => {
    if (!playerPosition || !isMoving) return;

    const playerCol = getColumnFromId(playerPosition);
    const playerRow = getRowFromId(playerPosition);

    // Oblicz pozycję gracza względem viewportu
    const playerViewportX = playerCol - viewportPosition.x;
    const playerViewportY = playerRow - viewportPosition.y;

    const margin = 2; // 2 kafelki od krawędzi
    let newX = viewportPosition.x;
    let newY = viewportPosition.y;

    // Sprawdź czy gracz jest blisko krawędzi viewportu
    if (playerViewportX < margin) {
      newX = Math.max(0, playerCol - margin);
    } else if (playerViewportX >= viewportWidth - margin) {
      newX = Math.min(
        fullMapWidth - viewportWidth,
        playerCol - viewportWidth + margin + 1
      );
    }

    if (playerViewportY < margin) {
      newY = Math.max(0, playerRow - margin);
    } else if (playerViewportY >= viewportHeight - margin) {
      newY = Math.min(
        fullMapHeight - viewportHeight,
        playerRow - viewportHeight + margin + 1
      );
    }

    // Zaktualizuj viewport jeśli potrzebna zmiana
    if (newX !== viewportPosition.x || newY !== viewportPosition.y) {
      setViewportPosition({ x: newX, y: newY });
    }
  }, [
    playerPosition,
    viewportPosition,
    setViewportPosition,
    viewportWidth,
    viewportHeight,
    fullMapWidth,
    fullMapHeight,
    getColumnFromId,
    getRowFromId,
    isMoving,
  ]);
};
