import "@/services/i18next"
import React, { useEffect, useState } from "react"
import { Image, Pressable, View } from "react-native"
import { Link, Stack } from "expo-router"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import { useFonts } from "expo-font"
import { CogIcon } from "@/components/ui/Icons"
import { Theme } from "@/constants/Theme"
import SplashScreen from "@/components/ui/SplashScreen"
import { auth } from "@/db/firebaseConfig"
import { LoginForm } from "@/components/LoginForm"
import {
  FirebaseAuthTypes,
  onAuthStateChanged,
} from "@react-native-firebase/auth"
import { useTranslation } from "react-i18next"
import { useStorage } from "@/hooks/useStorage"
import * as RNLocalize from "react-native-localize"
import { WaitingVerification } from "@/components/WaitingVerification"
import { getVersion } from "react-native-device-info"
import { FetchVersion } from "@/db/FetchVersion"
import { AppVersionUpdate } from "@/components/AppVersionUpdate"

export default function Layout() {
  const [isAppReady, setIsAppReady] = useState(false)
  const [isAppUpdated, setIsAppUpdated] = useState<boolean | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const { i18n } = useTranslation()
  const { getItem, setItem } = useStorage()

  const handleAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    setUser(user)
    if (initializing) setInitializing(false)
  }

  useEffect(() => {
    setLoading(true)

    const loadSettings = async () => {
      const locales = RNLocalize.getLocales()
      const vibration = await getItem("vibration")
      const languageCode = await getItem("language")

      if (!vibration) setItem("vibration", String(true))
      i18n.changeLanguage(languageCode ?? locales[0].languageCode)

      try {
        const currentVersion = getVersion()
        await FetchVersion().then((version) => {
          if (version?.version && currentVersion < version?.version) {
            setIsAppUpdated(false)
          } else {
            setIsAppUpdated(true)
          }

          setLoading(false)
        })
      } catch (error: any) {
        console.log("Error fetching version: ", error)
        setIsAppUpdated(true)
        setLoading(false)
      }
    }

    loadSettings()

    const subscriber = onAuthStateChanged(auth, handleAuthStateChanged)
    return subscriber
  }, [])

  const [loaded] = useFonts({
    Onest: require("../assets/fonts/onest-latin-400-normal.ttf"),
    OnestBold: require("../assets/fonts/onest-latin-800-normal.ttf"),
  })

  if (!loaded || !isAppReady) {
    return (
      <SplashScreen
        onFinish={(isCancelled) => !isCancelled && setIsAppReady(true)}
      />
    )
  }

  if (user && !isAppUpdated && loaded && isAppReady && !loading) {
    return <AppVersionUpdate />
  }

  return (
    <SafeAreaProvider
      style={{ height: "100%", backgroundColor: Theme.colors.background }}
    >
      <StatusBar style="auto" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        {user ? (
          !user?.emailVerified &&
          user?.uid !== "bd2qRZxUQSa0Rnxe9YhW4rB41bl1" ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <WaitingVerification />
            </View>
          ) : (
            <Stack
              screenOptions={{
                animationMatchesGesture: true,
                animation: "default",
                animationDuration: 100,
                contentStyle: { backgroundColor: Theme.colors.background },
                headerStyle: { backgroundColor: Theme.colors.background },
                headerTintColor: Theme.colors.text,
                headerTitle: "Stop Trivia",
                headerTitleStyle: {
                  fontSize: 24,
                  fontFamily: Theme.fonts.onestBold,
                },
                headerLeft: () => (
                  <Image
                    source={require("@/assets/ic_brand.png")}
                    style={{ width: 40, height: 40 }}
                  />
                ),
                headerRight: () => (
                  <Link asChild href="/settings">
                    <Pressable>
                      <CogIcon color={Theme.colors.text} />
                    </Pressable>
                  </Link>
                ),
              }}
            />
          )
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <LoginForm />
          </View>
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
