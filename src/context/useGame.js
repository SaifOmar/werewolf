// src/context/useGame.js
import { useContext } from "react";
import { GameContext } from "./GameContext";
import { GameProvider } from "./GameContext";

export const useGame = () => {
      const context = useContext(GameContext);
      if (!context) {
            throw new Error("useGame must be used within a GameProvider");
      }
      return context;
};
