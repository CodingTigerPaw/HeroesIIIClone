// components/GameInterface.tsx
import React from "react";

interface GameInterfaceProps {
  playerPosition: number | null;
  resources: { wood: number; stone: number; sulfur: number };
  getColumnFromId: (id: number) => number;
  getRowFromId: (id: number) => number;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
  playerPosition,
  resources,
  getColumnFromId,
  getRowFromId,
}) => {
  return (
    <div style={{ marginBottom: "10px" }}>
      <h2>Heroes III Clone</h2>
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
        Resources: Wood: {resources.wood}, Stone: {resources.stone}, Sulfur:{" "}
        {resources.sulfur}
      </p>
    </div>
  );
};
