import {
  getFirestore,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  updateDoc,
} from "@react-native-firebase/firestore"
import { StopModel, GameStatus, TTTModel } from "@/interfaces/Game"
import { Player } from "@/interfaces/Player"

const db = getFirestore()

class Fire {
  state = {
    stop: {
      gameId: "-1",
      round: 0,
      currentLetter: "-",
      currentTime: 120,
      gameStatus: GameStatus.CREATED,
      playersReady: 1,
      players: [{ id: "", name: "", points: 0, photoURL: "" }] as Player[],
      host: "no-host",
      startTime: Date.now(),
      timestamp: Date.now(),
    } as StopModel,
    ttt: {
      gameId: "-1",
      round: 0,
      currentPlayer: "X",
      gameStatus: GameStatus.CREATED,
      playersReady: 1,
      players: [{ id: "", name: "", points: 0, photoURL: "" }] as Player[],
      filledPos: ["", "", "", "", "", "", "", "", ""],
      host: "no-host",
      startTime: Date.now(),
      timestamp: Date.now(),
    } as TTTModel,
  }

  setGame = async (
    collectionName: string,
    id: string,
    data: StopModel | TTTModel
  ) => {
    const docRef = doc(db, collectionName, id)
    await setDoc(docRef, data)
    console.log(id)
  }

  getGame = async (
    collectionName: string,
    id: string
  ): Promise<StopModel | TTTModel | null> => {
    const docRef = doc(db, collectionName, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data() as StopModel | TTTModel
    } else {
      return null
    }
  }

  onGameChange(
    collection: string,
    docId: string,
    callback: (data: StopModel | TTTModel | null) => void
  ) {
    const ref = doc(db, collection, docId)
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as StopModel | TTTModel)
      } else {
        callback(null)
      }
    })

    return unsubscribe
  }

  updateGame = async (
    collectionName: string,
    gameId: string,
    data: StopModel | TTTModel | any
  ) => {
    const gameRef = doc(db, collectionName, gameId)
    await updateDoc(gameRef, data)
  }

  deleteGame = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id)
    await deleteDoc(docRef)
    console.log("Deleted game:", id)
  }
}

export default new Fire()
