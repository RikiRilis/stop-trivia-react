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
  host: string
  timestamp: number
}

export enum GameStatus {
  CREATED,
  IN_PROGRESS,
  STOPPED,
  DELETED,
}
