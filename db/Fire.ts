import {
  getFirestore,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  runTransaction,
} from "@react-native-firebase/firestore"
import { StopModel, GameStatus, TTTModel } from "@/interfaces/Game"
import { Player } from "@/interfaces/Player"
import { StopGameInputs } from "@/interfaces/StopGameInputs"

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

  updatePlayerInputs = async (
    collection: string,
    gameId: string,
    userId: string,
    inputs: StopGameInputs
  ) => {
    const gameRef = doc(db, collection, gameId)
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(gameRef)
      if (!snap.exists()) return
      const data = snap.data()
      const players = data?.players.map((p: Player) =>
        p.id === userId ? { ...p, inputs } : p
      )
      tx.update(gameRef, { players })
    })
  }

  deleteGame = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id)
    await deleteDoc(docRef)
  }

  getServerTimeMs = async (hostId: string): Promise<number> => {
    const ref = doc(db, "serverTime", hostId)
    await setDoc(ref, { now: serverTimestamp() })
    const snap = await getDoc(ref)
    const serverNow = snap.data()?.now?.toDate().getTime()
    return serverNow
  }

  getServerOffset = async (hostId: string): Promise<number> => {
    const ref = doc(db, "serverTime", hostId)
    const t0 = Date.now()
    await setDoc(ref, { now: serverTimestamp() })
    const snap = await getDoc(ref)
    const t1 = Date.now()
    const serverNow = snap.data()?.now?.toDate().getTime()

    const latency = (t1 - t0) / 2
    return serverNow - (t1 - latency)
  }
}

export default new Fire()
