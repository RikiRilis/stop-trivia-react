import { Theme } from "@/libs/consts"
import React, { useCallback, useState } from "react"
import { View, Text, Vibration, Pressable, Keyboard } from "react-native"
import { LinkIcon, OfflineIcon, OnlineIcon } from "@/components/ui/Icons"
import { Screen } from "@/components/ui/Screen"
import { useFocusEffect, useRouter } from "expo-router"
import { useStorage } from "@/hooks/useStorage"
import { parseBoolean } from "@/libs/parseBoolean"
import LottieView from "lottie-react-native"
import ic from "@/assets/lotties/ic_gamepad.json"
import { ModesButton } from "@/components/ModesButton"
import { FocusInput } from "@/components/FocusInput"

export default function Index() {
  const navigation = useRouter()
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const { getItem } = useStorage()

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        const vibrationValue = await getItem("vibration")
        setVibrationEnabled(parseBoolean(vibrationValue))
      }
      loadSettings()
    }, [])
  )

  const handlePress = (flag: string) => {
    if (vibrationEnabled) {
      Vibration.vibrate(10)
    }

    navigation.navigate("playing")
  }

  return (
    <Screen>
      <Pressable style={{ flex: 1 }} onPress={() => Keyboard.dismiss()}>
        <View style={{ flexDirection: "row", marginVertical: 16, gap: 12 }}>
          <Text
            style={{
              color: Theme.colors.text,
              fontSize: 18,
              fontFamily: "Onest",
            }}
          >
            Choose your mode
          </Text>

          <LottieView
            source={ic}
            autoPlay
            loop={false}
            duration={2000}
            style={{
              width: 24,
              height: 24,
            }}
          />
        </View>

        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <ModesButton
            icon={<OfflineIcon size={32} color={Theme.colors.accent} />}
            title="Play offline"
            subtitle="Play with friends in person!"
            flag="offline"
            onPress={() => handlePress("offline")}
          />
          <ModesButton
            icon={<OnlineIcon size={32} color={Theme.colors.accent} />}
            title="Play online"
            subtitle="Connect over the network"
            flag="online"
            onPress={() => handlePress("online")}
          />
          <ModesButton
            icon={<LinkIcon size={32} color={Theme.colors.accent} />}
            title="Join a game"
            flag="join"
            onPress={() => handlePress("join")}
          >
            <FocusInput placeholder="Code" type="numeric" />
          </ModesButton>
        </View>
      </Pressable>
    </Screen>
  )
}
