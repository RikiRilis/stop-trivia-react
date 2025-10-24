import { Player } from "@/interfaces/Player"

export interface StopModel {
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

export interface TTTModel {
  gameId: string
  round: number
  currentPlayer: string
  gameStatus: GameStatus
  playersReady: number
  players: Player[]
  filledPos: string[]
  host: string
  startTime: number
  timestamp: number
}

export enum GameStatus {
  CREATED,
  IN_PROGRESS,
  STOPPED,
}
