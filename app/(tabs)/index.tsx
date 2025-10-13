import { Theme } from "@/libs/consts"
import React, { useCallback, useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Vibration,
} from "react-native"
import {
  ForwardIcon,
  LinkIcon,
  OfflineIcon,
  OnlineIcon,
} from "@/components/ui/Icons"
import { Screen } from "@/components/ui/Screen"
import { useFocusEffect, useRouter } from "expo-router"
import { useStorage } from "@/hooks/useStorage"
import { parseBoolean } from "@/libs/parseBoolean"
import LottieView from "lottie-react-native"
import ic from "@/assets/lotties/ic_gamepad.json"

export default function Index() {
  const navigation = useRouter()
  const { getItem } = useStorage()
  const [vibrationEnabled, setVibrationEnabled] = useState(true)

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
        <Pressable
          onPress={() => handlePress("offline")}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? Theme.colors.background2
                : Theme.colors.primary2,
            },
            styles.pressables,
          ]}
        >
          <OfflineIcon size={32} color={Theme.colors.accent} />

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: Theme.colors.text,
                fontSize: 20,
                fontFamily: "OnestBold",
              }}
            >
              Play offline
            </Text>
            <Text
              style={{
                color: Theme.colors.gray,
                fontSize: 14,
                fontFamily: "Onest",
              }}
            >
              Play with friends in person!
            </Text>
          </View>

          <ForwardIcon size={32} color={Theme.colors.accent} />
        </Pressable>

        <Pressable
          onPress={() => handlePress("online")}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? Theme.colors.background2
                : Theme.colors.primary2,
            },
            styles.pressables,
          ]}
        >
          <OnlineIcon size={32} color={Theme.colors.accent} />

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: Theme.colors.text,
                fontSize: 20,
                fontFamily: "OnestBold",
              }}
            >
              Play online
            </Text>
            <Text
              style={{
                color: Theme.colors.gray,
                fontSize: 14,
                fontFamily: "Onest",
              }}
            >
              Connect over the network
            </Text>
          </View>

          <ForwardIcon size={32} color={Theme.colors.accent} />
        </Pressable>

        <Pressable
          onPress={() => handlePress("join")}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? Theme.colors.background2
                : Theme.colors.primary2,
            },
            styles.pressables,
          ]}
        >
          <LinkIcon size={32} color={Theme.colors.accent} />

          <View style={{ flex: 1, gap: 12 }}>
            <Text
              style={{
                color: Theme.colors.text,
                fontSize: 20,
                fontFamily: "OnestBold",
              }}
            >
              Join a game
            </Text>

            <TextInput
              placeholder="Code"
              placeholderTextColor={Theme.colors.darkGray}
              keyboardType="numeric"
              cursorColor={Theme.colors.accent}
              style={{
                backgroundColor: Theme.colors.background2,
                borderRadius: 16,
                padding: 12,
                color: Theme.colors.text,
                fontFamily: "Onest",
              }}
            />
          </View>

          <ForwardIcon size={32} color={Theme.colors.accent} />
        </Pressable>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  pressables: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
  },
})
