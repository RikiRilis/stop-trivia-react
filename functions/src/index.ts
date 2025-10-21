import { onSchedule } from "firebase-functions/v2/scheduler"
import * as admin from "firebase-admin"

admin.initializeApp()
const db = admin.firestore()

export const cleanUpOldDocuments = onSchedule("every 24 hours", async () => {
  try {
    const collections = ["stop", "ttt"]

    // Now in milliseconds
    const now = Date.now()
    const cutoff = now - 24 * 60 * 60 * 1000 // 24h ago

    for (const name of collections) {
      // Compare as number instead of Timestamp
      const snapshot = await db
        .collection(name)
        .where("timestamp", "<", cutoff)
        .get()

      if (snapshot.empty) {
        console.log(`No old documents found in '${name}'.`)
        continue
      }

      console.log(`Deleting ${snapshot.size} old documents from '${name}'...`)

      const batch = db.batch()
      snapshot.docs.forEach((doc) => batch.delete(doc.ref))
      await batch.commit()

      console.log(`Successfully deleted old documents from '${name}'.`)
    }

    console.log("Cleanup task completed successfully.")
  } catch (error) {
    console.error("Error cleaning up old documents:", error)
  }
})
