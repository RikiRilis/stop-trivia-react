import {
  getFirestore,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  updateDoc,
} from "@react-native-firebase/firestore"
import { GameModel, GameStatus } from "@/interfaces/Game"
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
      players: [{ id: "", name: "", points: 0 }] as Player[],
      host: "no-host",
      timestamp: Date.now(),
    } as GameModel,
  }

  setGame = async (collectionName: string, id: string, data: GameModel) => {
    const docRef = doc(db, collectionName, id)
    await setDoc(docRef, data)
    console.log(id)
  }

  getGame = async (
    collectionName: string,
    id: string
  ): Promise<GameModel | null> => {
    const docRef = doc(db, collectionName, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data() as GameModel
    } else {
      return null
    }
  }

  onGameChange(
    collection: string,
    docId: string,
    callback: (data: GameModel | null) => void
  ) {
    const ref = doc(db, collection, docId)
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as GameModel)
      } else {
        callback(null)
      }
    })

    return unsubscribe
  }

  updateGame = async (
    collectionName: string,
    gameId: string,
    data: GameModel | any
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
