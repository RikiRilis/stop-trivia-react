import React, { useState } from "react"
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
  Image,
} from "react-native"
import { Stack, useNavigation } from "expo-router"
import {
  BackIcon,
  CheckIcon,
  PlayIcon,
  RestartIcon,
  UsersIcon,
} from "@/components/ui/Icons"
import { Screen } from "@/components/ui/Screen"
import { Theme } from "@/libs/consts"
import { FocusInput } from "@/components/FocusInput"
import { PlayingButton } from "@/components/PlayingButton"

export default function Playing() {
  const [loading, setLoading] = useState<boolean>(true)
  const [players, setPlayers] = useState<number>(1)
  const [round, setRound] = useState<number>(1)
  const [letter, setLetter] = useState<string>("A")
  const [points, setPoints] = useState<number>(100)

  const navigation = useNavigation()

  const handlePress = (flag: string) => {
    console.log(flag)
    Vibration.vibrate(10)
    return
  }

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerTintColor: Theme.colors.text,
          headerTitle: loading ? "Loading..." : "Playing",
          headerTitleStyle: {
            fontWeight: "condensed",
            fontSize: 24,
            fontFamily: "OnestBold",
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <BackIcon size={34} onPress={() => navigation.goBack()} />
          ),
          headerRight: () => <CurrentPlayers players={players} />,
        }}
      />

      <Pressable style={{ flex: 1 }} onPress={() => Keyboard.dismiss()}>
        <View style={{ flex: 1, width: "100%" }}>
          <View style={{ flex: 1, flexDirection: "row", gap: 18 }}>
            <View style={styles.columns}>
              <FocusInput placeholder="Name" />
              <FocusInput placeholder="Country" />
              <FocusInput placeholder="Animal" />
              <FocusInput placeholder="Food" />
              <FocusInput placeholder="Object" />
            </View>

            <View style={styles.columns}>
              <FocusInput placeholder="Last Name" />
              <FocusInput placeholder="Color" />
              <FocusInput placeholder="Artist" />
              <FocusInput placeholder="Fruit" />
              <FocusInput placeholder="Profession" />
            </View>
          </View>

          <View
            style={{ flexDirection: "column", gap: 12, paddingVertical: 24 }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={styles.texts}>Round: {round}</Text>
              <Text style={styles.texts}>Letter: {letter}</Text>
              <Text style={styles.texts}>Your points: {points}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <PlayingButton
                flag="play"
                onPress={() => handlePress("play")}
                icon={<PlayIcon size={30} />}
              />
              <PlayingButton
                flag="play"
                onPress={() => handlePress("ready")}
                icon={<CheckIcon size={30} />}
              />
              <PlayingButton
                flag="play"
                onPress={() => handlePress("stop")}
                icon={
                  <Image
                    source={require("@/assets/ic_brand.png")}
                    style={{ width: 30, height: 30 }}
                  />
                }
              />
              <PlayingButton
                flag="play"
                onPress={() => handlePress("restart")}
                icon={<RestartIcon size={30} />}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Screen>
  )
}

const CurrentPlayers = ({ players }: { players: number }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <UsersIcon color={Theme.colors.accent} />
      <Text style={{ color: Theme.colors.accent, fontFamily: "OnestBold" }}>
        {players}/4
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  columns: {
    flex: 1,
    flexDirection: "column",
    gap: 18,
  },
  buttons: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: "flex-start",
  },
  texts: {
    color: Theme.colors.lightGray,
    alignSelf: "flex-start",
    fontFamily: "OnestBold",
  },
})
