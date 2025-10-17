// firebaseConfig.js
import { getApp, getApps, initializeApp } from "@react-native-firebase/app"
import { getReactNativePersistence } from "firebase/auth"
import { initializeAuth } from "@react-native-firebase/auth"
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
const auth = initializeAuth(getApp(), {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
})

export { app, auth }
