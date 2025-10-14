// firebaseConfig.js
import { getApp, getApps, initializeApp } from "firebase/app"
import { getReactNativePersistence, initializeAuth } from "firebase/auth"
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"

export const firebaseConfig = {
  apiKey: "AIzaSyBKXxcdMIvT-zHIgmRPJvJbvGflgjBpsYE",
  authDomain: "stop-trivia-online.firebaseapp.com",
  databaseURL: "https://stop-trivia-online-default-rtdb.firebaseio.com",
  projectId: "stop-trivia-online",
  storageBucket: "stop-trivia-online.firebasestorage.app",
  messagingSenderId: "744895848346",
  appId: "1:744895848346:web:9a7ab0d3d952c91ee9a423",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
})

export { app, auth }
