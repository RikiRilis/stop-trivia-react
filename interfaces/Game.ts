import { Player } from "@/interfaces/Player"

export interface GameModel {
  gameId: string
  round: number
  currentLetter: string
  currentTime: number
  gameStatus: GameStatus
  players: number
  playersReady: number
  playersNames: Player[]
}

export enum GameStatus {
  CREATED,
  JOINED,
  STARTING,
  IN_PROGRESS,
  FINISHED,
  DELETED,
}
