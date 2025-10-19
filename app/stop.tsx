import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
  Image,
  ToastAndroid,
  BackHandler,
  NativeEventSubscription,
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
  CopyIcon,
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
import { useTranslation } from "react-i18next"
import { BottomSheetModal } from "@/components/BottomSheetModal"
import BottomSheet from "@gorhom/bottom-sheet"
import { CustomModal } from "@/components/CustomModal"
import Clipboard from "@react-native-clipboard/clipboard"

export default function Stop() {
  const [gameData, setGameData] = useState<GameModel | null>(null)
  const [points, setPoints] = useState<number>(0)
  const [title, setTitle] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | string>(3)
  const [timeLeft, setTimeLeft] = useState<number>(300)
  const [letter, setLetter] = useState<string>("-")
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>()
  const [closeModalVisible, setCloseModalVisible] = useState<boolean>(false)
  const [restartModalVisible, setRestartModalVisible] = useState<boolean>(false)
  const [ready, setReady] = useState<boolean>(false)
  const [isStarting, setIsStarting] = useState(false)
  const [inputs, setInputs] = useState({
    name: "",
    country: "",
    animal: "",
    food: "",
    object: "",
    lastName: "",
    color: "",
    artist: "",
    fruit: "",
    profession: "",
  })

  const sheetRef = useRef<BottomSheet>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownStarted = useRef(false)

  const navigation = useNavigation()
  const { getItem } = useStorage()
  const { t } = useTranslation()

  const { mode, id, time } = useLocalSearchParams<{
    mode: string
    id: string
    time: string
  }>()

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
    let gameTime = +time
    let unsubscribe: (() => void) | undefined
    let backHandler: NativeEventSubscription
    let currentGameData: GameModel
    console.log(mode, id, gameTime)
    setTimeLeft(gameTime)

    if (mode === "online") {
      gameId = sixDigit()
      Fire.setGame("stop", gameId, {
        gameId,
        round: 0,
        currentLetter: "-",
        currentTime: gameTime,
        gameStatus: GameStatus.CREATED,
        playersReady: 1,
        players: [
          {
            id: getAuth().currentUser?.uid,
            name: getAuth().currentUser?.displayName,
            points: 0,
          },
        ],
        host: getAuth().currentUser?.uid || "no-host",
        startTime: 0,
        timestamp: Date.now(),
      })
    }

    if (mode === "join") {
      Fire.getGame("stop", gameId).then((data) => {
        if (!data) return
        const userName = getAuth().currentUser?.displayName
        const userId = getAuth().currentUser?.uid
        const alreadyIn = data.players.some((p) => p.id === userId)

        if (!alreadyIn) {
          Fire.updateGame("stop", gameId, {
            players: [
              ...data.players,
              {
                id: userId,
                name: userName,
                points: 0,
              },
            ],
          })
        }
      })
    }

    if (mode === "offline") {
      const backPress = (): boolean => {
        return handleBackPress(currentGameData)
      }

      backHandler = BackHandler.addEventListener("hardwareBackPress", backPress)

      return
    }

    unsubscribe = Fire.onGameChange("stop", gameId, (data) => {
      if (!data) {
        if (mode === "join") {
          ToastAndroid.showWithGravity(
            t("host_closed_game"),
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
          )
          navigation.goBack()
          if (timerRef.current) clearInterval(timerRef.current)
        }
        return
      }

      currentGameData = data
      setGameData(currentGameData)
      setTitleByGameStatus(currentGameData.gameStatus)

      if (
        currentGameData.gameStatus === GameStatus.IN_PROGRESS &&
        !countdownStarted.current
      ) {
        countdownStarted.current = true
        handleCountdownSync(currentGameData)
        setTimeLeft(data.currentTime)
      }

      if (currentGameData.gameStatus === GameStatus.STOPPED) {
        countdownStarted.current = false
        setCountdown(3)
        stopTimer()
      }

      const backPress = (): boolean => {
        return handleBackPress(currentGameData)
      }

      backHandler = BackHandler.addEventListener("hardwareBackPress", backPress)
    })

    return () => {
      console.log("Cleaning up...")

      if (unsubscribe) {
        unsubscribe()
        unsubscribe = undefined
      }

      if (backHandler) backHandler.remove()

      if (mode === "online" && gameId) {
        Fire.deleteGame("stop", gameId)
      }

      if (mode === "join" && gameId && currentGameData) {
        Fire.updateGame("stop", gameId, {
          players: currentGameData
            ? currentGameData.players.filter(
                (player) => player.id !== getAuth().currentUser?.uid
              )
            : [],
          playersReady:
            currentGameData && currentGameData.playersReady > 1
              ? currentGameData.players.length - 1
              : 1,
        }).catch(() => null)
      }
    }
  }, [])

  const setTitleByGameStatus = (gameStatus: number | undefined) => {
    switch (gameStatus) {
      case GameStatus.CREATED:
        setTitle(t("waiting_players"))
        break
      case GameStatus.IN_PROGRESS:
        setTitle(t("fill_spaces"))
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
        if (gameData.players.length < 2) {
          vibrationEnabled && Vibration.vibrate(100)
          ToastAndroid.showWithGravity(
            t("you_are_alone"),
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
          )
          return
        }

        if (gameData.players.length !== gameData.playersReady) {
          vibrationEnabled && Vibration.vibrate(100)
          ToastAndroid.showWithGravity(
            t("not_all_players_ready"),
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
          )
          return
        }

        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        const randomLetter = letters.charAt(
          Math.floor(Math.random() * letters.length)
        )

        await Fire.updateGame("stop", gameData.gameId, {
          gameStatus: GameStatus.IN_PROGRESS,
          currentLetter: randomLetter,
          startTime: Date.now(),
        })
      }
      return
    }

    if (flag === "stop") {
      stopTimer()
      Fire.updateGame("stop", gameData.gameId, {
        gameStatus: GameStatus.STOPPED,
        playersReady: 1,
      })
      return
    }

    if (flag === "ready") {
      Fire.updateGame("stop", gameData.gameId, {
        playersReady: gameData.playersReady + 1,
      })

      setReady(true)
    }

    if (flag === "restart") {
      if (mode === "offline") handleRestartInputs()
      setRestartModalVisible(true)
    }
  }

  const handleCountdownSync = (data: GameModel) => {
    let counter = 3

    vibrationEnabled && Vibration.vibrate(30)
    stopTimer()
    setCountdown(3)
    setIsStarting(true)
    handleRestartInputs()

    Fire.updateGame("stop", data.gameId, {
      round: data.round + 1,
    })

    timerRef.current = setInterval(() => {
      vibrationEnabled && Vibration.vibrate(30)
      counter--
      setCountdown(counter)
      if (counter === 0) {
        stopTimer()
        setCountdown(data.currentLetter)
        setLetter(data.currentLetter)
        handleTimer(data)
        setIsStarting(false)
      }
    }, 1000)
  }

  const handleTimer = (data: GameModel) => {
    let time = data.currentTime + 3
    const elapsed = Math.floor((Date.now() - data.startTime) / 1000)

    timerRef.current = setInterval(() => {
      time--
      setTimeLeft(time - elapsed)

      if (time === 0) {
        stopTimer()
        vibrationEnabled && Vibration.vibrate(1000)
        Fire.updateGame("stop", data.gameId, {
          gameStatus: GameStatus.STOPPED,
          playersReady: 1,
        })
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      setReady(false)
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const handleSumPoints = (toAdd: number) => {
    if (mode === "offline") {
      setPoints(points + toAdd)
    }

    if (!gameData) return
    const userId = getAuth().currentUser?.uid
    if (!userId) return

    setPoints(points + toAdd)

    const updatedPlayers = gameData.players.map((player) => {
      if (player.id === userId) {
        return {
          ...player,
          points: player.points + toAdd,
        }
      }
      return player
    })

    Fire.updateGame("stop", gameData.gameId, {
      players: updatedPlayers,
    })
  }

  const handleBackPress = (data?: GameModel | null): boolean => {
    const currentData = data ?? gameData

    if (mode === "offline") handleOnExit()
    if (!currentData) return true
    if (currentData.gameStatus === GameStatus.IN_PROGRESS) {
      vibrationEnabled && Vibration.vibrate(100)
      return true
    }

    if (currentData.players.length <= 1) {
      handleOnExit()
      return true
    }

    mode === "online" && setCloseModalVisible(true)
    mode === "join" && handleOnExit()
    return true
  }

  const handleRestartInputs = () => {
    setRestartModalVisible(false)
    setInputs({
      name: "",
      country: "",
      animal: "",
      food: "",
      object: "",
      lastName: "",
      color: "",
      artist: "",
      fruit: "",
      profession: "",
    })
  }

  const copyRoomCode = () => {
    vibrationEnabled && Vibration.vibrate(10)
    Clipboard.setString(gameData?.gameId ?? "")
    ToastAndroid.showWithGravity(
      t("copied_clipboard"),
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    )
  }

  const handleOnExit = () => {
    setCloseModalVisible(false)
    navigation.goBack()
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
            <BackIcon size={34} onPress={() => handleBackPress(gameData)} />
          ),
          headerRight: () => (
            <CurrentPlayers
              onPress={() => mode !== "offline" && sheetRef.current?.expand()}
              players={gameData?.players.length}
            />
          ),
        }}
      />

      <CustomModal
        title={t("restart_inputs")}
        description={t("restart_inputs_desc")}
        modalVisible={restartModalVisible}
        onRequestClose={() => {
          setRestartModalVisible(!restartModalVisible)
        }}
        onAccept={handleRestartInputs}
      />

      <CustomModal
        title={t("close_room")}
        description={t("close_room_desc")}
        modalVisible={closeModalVisible}
        onRequestClose={() => {
          setCloseModalVisible(!closeModalVisible)
        }}
        onAccept={handleOnExit}
      />

      <Pressable style={{ flex: 1 }} onPress={() => Keyboard.dismiss()}>
        <View style={{ flex: 1, width: "100%" }}>
          {mode !== "offline" && (
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
                {t("time_left")}: {formatTime(timeLeft)}
              </Text>
            </View>
          )}

          <View style={{ flex: 1, flexDirection: "row", gap: 18 }}>
            <View style={styles.columns}>
              <FocusInput
                editable={
                  mode === "offline"
                    ? true
                    : gameData?.gameStatus === GameStatus.IN_PROGRESS &&
                      !isStarting
                }
                onChange={(text) => setInputs({ ...inputs, name: text })}
                value={inputs.name}
                placeholder={t("name")}
              />
              <FocusInput
                editable={
                  mode === "offline"
                    ? true
                    : gameData?.gameStatus === GameStatus.IN_PROGRESS &&
                      !isStarting
                }
                onChange={(text) => setInputs({ ...inputs, country: text })}
                value={inputs.country}
                placeholder={t("country")}
              />
              <FocusInput
                editable={
                  mode === "offline"
                    ? true
                    : gameData?.gameStatus === GameStatus.IN_PROGRESS &&
                      !isStarting
                }
                onChange={(text) => setInputs({ ...inputs, animal: text })}
                value={inputs.animal}
                placeholder={t("animal")}
              />
              <FocusInput
                editable={
                  mode === "offline"
                    ? true
                    : gameData?.gameStatus === GameStatus.IN_PROGRESS &&
                      !isStarting
                }
                onChange={(text) => setInputs({ ...inputs, food: text })}
                value={inputs.food}
                placeholder={t("food")}
              />
              <FocusInput
                editable={
                  mode === "offline"
                    ? true
                    : gameData?.gameStatus === GameStatus.IN_PROGRESS &&
                      !isStarting
                }
                onChange={(text) => setInputs({ ...inputs, object: text })}
                value={inputs.object}
                placeholder={t("object")}
              />
            </View>

            <View style={styles.columns}>
              <FocusInput
                editable={
                  mode === "offline"
                    ? true
                    : gameData?.gameStatus === GameStatus.IN_PROGRESS &&
                      !isStarting
                }
                onChange={(text) => setInputs({ ...inputs, lastName: text })}
                value={inputs.lastName}
                placeholder={t("last_name")}
              />
              <FocusInput
                editable={
                  mode === "offline"
                    ? true
                    : gameData?.gameStatus === GameStatus.IN_PROGRESS &&
                      !isStarting
                }
                onChange={(text) => setInputs({ ...inputs, color: text })}
                value={inputs.color}
                placeholder={t("color")}
              />
              <FocusInput
                editable={
                  mode === "offline"
                    ? true
                    : gameData?.gameStatus === GameStatus.IN_PROGRESS &&
                      !isStarting
                }
                onChange={(text) => setInputs({ ...inputs, artist: text })}
                value={inputs.artist}
                placeholder={t("artist")}
              />
              <FocusInput
                editable={
                  mode === "offline"
                    ? true
                    : gameData?.gameStatus === GameStatus.IN_PROGRESS &&
                      !isStarting
                }
                onChange={(text) => setInputs({ ...inputs, fruit: text })}
                value={inputs.fruit}
                placeholder={t("fruit")}
              />
              <FocusInput
                editable={
                  mode === "offline"
                    ? true
                    : gameData?.gameStatus === GameStatus.IN_PROGRESS &&
                      !isStarting
                }
                onChange={(text) => setInputs({ ...inputs, profession: text })}
                value={inputs.profession}
                placeholder={t("profession")}
              />
            </View>
          </View>

          {gameData?.gameStatus !== GameStatus.STOPPED && mode !== "offline" ? (
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
              <Text style={styles.texts}>
                {t("round")}:{" "}
                {gameData?.round === 0 ? 1 : (gameData?.round ?? 0)}
              </Text>
              <Text style={styles.texts}>
                {t("letter")}: {letter}
              </Text>
              <Text style={styles.texts}>
                {t("your_points")}: {points}
              </Text>
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
                <>
                  {mode === "online" && (
                    <PlayingButton
                      flag="play"
                      onPress={() => handlePress("play")}
                      icon={<PlayIcon size={30} />}
                    />
                  )}

                  {mode === "join" && !ready && (
                    <PlayingButton
                      flag="ready"
                      onPress={() => handlePress("ready")}
                      icon={<CheckIcon size={30} />}
                    />
                  )}
                </>
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

      <BottomSheetModal title={t("players")} ref={sheetRef}>
        <View style={{ marginBottom: 8, gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: Theme.colors.accent,
                fontFamily: "Onest",
                fontSize: 16,
              }}
            >
              {gameData?.gameId}
            </Text>

            <Pressable onPress={copyRoomCode}>
              <CopyIcon color={Theme.colors.accent} size={16} />
            </Pressable>
          </View>

          {gameData &&
            gameData.players.map((player) => (
              <View
                key={player.id}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  backgroundColor: Theme.colors.background2,
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    color: Theme.colors.gray,
                    fontFamily: "OnestBold",
                    fontSize: 18,
                  }}
                >
                  {player.name}
                </Text>
                <Text
                  style={{
                    color: Theme.colors.gray,
                    fontFamily: "Onest",
                    fontSize: 18,
                  }}
                >
                  {player.points}
                </Text>
              </View>
            ))}
        </View>
      </BottomSheetModal>
    </Screen>
  )
}

const CurrentPlayers = ({
  players = 1,
  onPress,
}: {
  players?: number
  onPress: () => void
}) => {
  return (
    <Pressable
      onPress={onPress}
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
    </Pressable>
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
  modalView: {
    margin: 20,
    backgroundColor: Theme.colors.background,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBottomButtons: {
    padding: 12,
    borderRadius: 16,
  },
})
