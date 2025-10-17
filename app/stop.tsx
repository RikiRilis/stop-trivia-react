import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
  Image,
} from "react-native"
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router"
import {
  BackIcon,
  CheckIcon,
  PlayIcon,
  RestartIcon,
  UsersIcon,
} from "@/components/ui/Icons"
import { Screen } from "@/components/ui/Screen"
import { Theme } from "@/constants/Theme"
import { FocusInput } from "@/components/FocusInput"
import { PlayingButton } from "@/components/PlayingButton"
import Fire from "@/db/Fire"
import { sixDigit } from "@/libs/randomId"
import { GameModel, GameStatus } from "@/interfaces/Game"
import { getAuth } from "@react-native-firebase/auth"
import { formatTime } from "@/libs/formatTime"
import { useStorage } from "@/hooks/useStorage"
import { parseBoolean } from "@/libs/parseBoolean"

export default function Playing() {
  const [gameData, setGameData] = useState<GameModel | null>()
  const [points, setPoints] = useState<number>(0)
  const [title, setTitle] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | string>(0)
  const [timeLeft, setTimeLeft] = useState<number>(120)
  const [letter, setLetter] = useState<string>("-")
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>()

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownStarted = useRef(false)

  const navigation = useNavigation()
  const { getItem } = useStorage()

  const { mode, id } = useLocalSearchParams<{ mode: string; id: string }>()

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        const vibrationValue = await getItem("vibration")
        setVibrationEnabled(parseBoolean(vibrationValue))
      }
      loadSettings()
    }, [])
  )

  useEffect(() => {
    let gameId = id
    let unsubscribe: (() => void) | undefined

    if (mode === "online") {
      gameId = sixDigit()

      Fire.setGame("stop", gameId, {
        gameId,
        round: 1,
        currentLetter: "-",
        currentTime: 120,
        gameStatus: GameStatus.CREATED,
        players: 1,
        playersReady: 1,
        playersNames: [
          {
            id: getAuth().currentUser?.uid,
            name: getAuth().currentUser?.displayName,
            points: 0,
          },
        ],
        host: getAuth().currentUser?.uid || "no-host",
        timestamp: Date.now(),
      })
    }

    unsubscribe = Fire.onGameChange("stop", gameId, (data) => {
      if (!data) return
      setGameData(data)
      setTitleByGameStatus(data.gameStatus)

      if (
        data.gameStatus === GameStatus.IN_PROGRESS &&
        !countdownStarted.current
      ) {
        countdownStarted.current = true
        handleCountdownSync(data)
        setTimeLeft(120)
      }

      if (data.gameStatus === GameStatus.STOPPED) {
        countdownStarted.current = false
        setCountdown(3)
      }
    })

    return () => {
      if (mode === "online" && gameId) {
        Fire.deleteGame("stop", gameId)
      }

      if (mode === "join" && gameId) {
        Fire.updateGame("stop", gameId, {
          players: gameData ? gameData.players - 1 : 0,
          playersNames: gameData
            ? gameData.playersNames.filter(
                (player) => player.id !== getAuth().currentUser?.uid
              )
            : [],
        })
      }

      if (unsubscribe) unsubscribe()
    }
  }, [])

  const setTitleByGameStatus = (gameStatus: number | undefined) => {
    switch (gameStatus) {
      case GameStatus.CREATED:
        setTitle("Waiting for players")
        break
      case GameStatus.IN_PROGRESS:
        setTitle("Fill the spaces!")
        break
      case GameStatus.STOPPED:
        setTitle("STOP!")
        break
    }
  }

  const handlePress = async (flag: string) => {
    if (!gameData) return

    const userId = getAuth().currentUser?.uid

    if (flag === "play") {
      if (gameData.host === userId) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        const randomLetter = letters.charAt(
          Math.floor(Math.random() * letters.length)
        )

        await Fire.updateGame("stop", gameData.gameId, {
          gameStatus: GameStatus.IN_PROGRESS,
          currentLetter: randomLetter,
        })
      }
      return
    }

    if (flag === "stop") {
      stopTimer()
      Fire.updateGame("stop", gameData.gameId, {
        gameStatus: GameStatus.STOPPED,
      })
      return
    }

    if (flag === "ready") {
      Fire.updateGame("stop", gameData.gameId, {
        playersReady: gameData.playersReady + 1,
      })
    }
  }

  const handleCountdownSync = (data: GameModel) => {
    vibrationEnabled && Vibration.vibrate(30)
    setCountdown(3)
    let counter = 3

    timerRef.current = setInterval(() => {
      vibrationEnabled && Vibration.vibrate(30)
      counter--
      setCountdown(counter)
      if (counter === 0) {
        clearInterval(timerRef.current!)
        timerRef.current = null
        setCountdown(data.currentLetter)
        setLetter(data.currentLetter)
        initGame(data)
      }
    }, 1000)
  }

  const handleTimer = (data: GameModel) => {
    let time = 120
    timerRef.current = setInterval(() => {
      time--
      setTimeLeft(time)

      if (time === 0) {
        clearInterval(timerRef.current!)
        timerRef.current = null
        vibrationEnabled && Vibration.vibrate(1000)
        Fire.updateGame("stop", data.gameId, {
          gameStatus: GameStatus.STOPPED,
        })
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const initGame = (data: GameModel) => {
    handleTimer(data)
  }

  const handleSumPoints = (toAdd: number) => {
    if (!gameData) return

    setPoints(points + toAdd)

    Fire.updateGame("stop", gameData!.gameId, {
      playersNames: gameData?.playersNames.map((player) => {
        if (player.id === getAuth().currentUser?.uid) {
          return {
            ...player,
            points: points + toAdd,
          }
        }
      }),
    })
  }

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerTintColor: Theme.colors.text,
          headerTitle: title ?? "Stop Trivia",
          headerTitleStyle: {
            fontSize: 24,
            fontFamily: "OnestBold",
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <BackIcon size={34} onPress={() => navigation.goBack()} />
          ),
          headerRight: () => <CurrentPlayers players={gameData?.players} />,
        }}
      />

      <Pressable style={{ flex: 1 }} onPress={() => Keyboard.dismiss()}>
        <View style={{ flex: 1, width: "100%" }}>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              paddingVertical: 24,
            }}
          >
            <Text
              style={{
                color: Theme.colors.gray,
                fontFamily: "Onest",
                fontSize: 18,
              }}
            >
              Time left: {formatTime(timeLeft)}
            </Text>
          </View>
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

          {gameData?.gameStatus !== GameStatus.STOPPED ? (
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 12,
                paddingVertical: 24,
              }}
            >
              <Text
                style={{
                  color: Theme.colors.text,
                  fontFamily: "OnestBold",
                  fontSize: 96,
                }}
              >
                {countdown}
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={() => handleSumPoints(25)}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? Theme.colors.background2
                      : Theme.colors.primary2,
                  },
                  styles.buttons,
                ]}
              >
                <Text style={styles.texts}>25</Text>
              </Pressable>

              <Pressable
                onPress={() => handleSumPoints(50)}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? Theme.colors.background2
                      : Theme.colors.primary2,
                  },
                  styles.buttons,
                ]}
              >
                <Text style={styles.texts}>50</Text>
              </Pressable>

              <Pressable
                onPress={() => handleSumPoints(75)}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? Theme.colors.background2
                      : Theme.colors.primary2,
                  },
                  styles.buttons,
                ]}
              >
                <Text style={styles.texts}>75</Text>
              </Pressable>

              <Pressable
                onPress={() => handleSumPoints(100)}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? Theme.colors.background2
                      : Theme.colors.primary2,
                  },
                  styles.buttons,
                ]}
              >
                <Text style={styles.texts}>100</Text>
              </Pressable>
            </View>
          )}

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
              <Text style={styles.texts}>Round: {gameData?.round}</Text>
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
              {gameData?.gameStatus !== GameStatus.IN_PROGRESS && (
                <PlayingButton
                  flag="play"
                  onPress={() => handlePress("play")}
                  icon={<PlayIcon size={30} />}
                />
              )}

              {mode !== "online" && (
                <PlayingButton
                  flag="ready"
                  onPress={() => handlePress("ready")}
                  icon={<CheckIcon size={30} />}
                />
              )}

              {gameData?.gameStatus === GameStatus.IN_PROGRESS && (
                <PlayingButton
                  flag="stop"
                  onPress={() => handlePress("stop")}
                  icon={
                    <Image
                      source={require("@/assets/ic_brand.png")}
                      style={{ width: 30, height: 30 }}
                    />
                  }
                />
              )}

              {gameData?.gameStatus !== GameStatus.IN_PROGRESS && (
                <PlayingButton
                  flag="restart"
                  onPress={() => handlePress("restart")}
                  icon={<RestartIcon size={30} />}
                />
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Screen>
  )
}

const CurrentPlayers = ({ players = 0 }: { players?: number }) => {
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
