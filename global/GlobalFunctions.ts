import { GameModel } from "@/interfaces/Game"

export const validateGame = (game: GameModel) => {
  return !!game.timestamp && typeof game.timestamp === "number"
}
