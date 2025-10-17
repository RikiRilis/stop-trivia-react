import { app } from "@/libs/firebaseConfig"
import { getFirestore } from "firebase/firestore"

export const db = getFirestore(app)
