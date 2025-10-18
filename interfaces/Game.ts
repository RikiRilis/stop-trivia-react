import { Player } from "@/interfaces/Player"

export interface GameModel {
  gameId: string
  round: number
  currentLetter: string
  currentTime: number
  gameStatus: GameStatus
  playersReady: number
  players: Player[]
  host: string
  startTime: number
  timestamp: number
}

export enum GameStatus {
  CREATED,
  IN_PROGRESS,
  STOPPED,
}
