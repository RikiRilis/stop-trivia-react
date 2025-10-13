import { CogIcon } from "@/components/ui/Icons";
import { Theme } from "@/libs/consts";
import { Link, Stack } from "expo-router";
import { Image, Pressable } from "react-native";
import { useFonts } from "expo-font";
import React, { useState } from "react";
import SplashScreen from "@/components/ui/SplashScreen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  const [isAppReady, setIsAppReady] = useState(false);

  const [loaded] = useFonts({
    Onest: require("../assets/fonts/onest-latin-400-normal.ttf"),
    OnestBold: require("../assets/fonts/onest-latin-800-normal.ttf"),
  });

  if (!loaded || !isAppReady) {
    return (
      <SplashScreen
        onFinish={(isCancelled) => !isCancelled && setIsAppReady(true)}
      />
    );
  }

  return (
    <SafeAreaProvider
      style={{ height: "100%", backgroundColor: Theme.colors.background }}
    >
      <StatusBar style="auto" />
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
            fontFamily: "OnestBold",
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
                <CogIcon />
              </Pressable>
            </Link>
          ),
        }}
      />
    </SafeAreaProvider>
  );
}
