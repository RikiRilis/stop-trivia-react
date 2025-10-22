import { StopGameInputs } from "./StopGameInputs"

export interface Player {
  id?: string | null
  name?: string | null
  points: number
  photoURL?: string
  inputs?: StopGameInputs
}
