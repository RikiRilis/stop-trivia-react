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
  Modal,
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

export default function Stop() {
  const [gameData, setGameData] = useState<GameModel | null>()
  const [points, setPoints] = useState<number>(0)
  const [title, setTitle] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | string>(3)
  const [timeLeft, setTimeLeft] = useState<number>(300)
  const [letter, setLetter] = useState<string>("-")
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>()
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [ready, setReady] = useState<boolean>(false)
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

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownStarted = useRef(false)

  const navigation = useNavigation()
  const { getItem } = useStorage()

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
        round: 1,
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

    unsubscribe = Fire.onGameChange("stop", gameId, (data) => {
      if (!data) return
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
      }

      const backPress = (): boolean => {
        return handleBackPress(currentGameData)
      }

      backHandler = BackHandler.addEventListener("hardwareBackPress", backPress)
    })

    return () => {
      if (mode === "online" && gameId) {
        Fire.deleteGame("stop", gameId)
      }

      if (mode === "join" && gameId) {
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
        })
      }

      if (unsubscribe) unsubscribe()
      backHandler.remove()
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
        if (gameData.players.length < 2) {
          vibrationEnabled && Vibration.vibrate(100)
          ToastAndroid.showWithGravity(
            "You're alone!",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
          )
          return
        }

        if (gameData.players.length !== gameData.playersReady) {
          vibrationEnabled && Vibration.vibrate(100)
          ToastAndroid.showWithGravity(
            "Not all players are ready",
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
        stopTimer()
        setCountdown(data.currentLetter)
        setLetter(data.currentLetter)
        initGame(data)
      }
    }, 1000)
  }

  const handleTimer = (data: GameModel) => {
    let time = data.currentTime
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

  const initGame = (data: GameModel) => {
    handleTimer(data)
  }

  const handleSumPoints = (toAdd: number) => {
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

  const handleBackPress = (data: GameModel): boolean => {
    if (!data) return true
    if (data.gameStatus === GameStatus.IN_PROGRESS) {
      vibrationEnabled && Vibration.vibrate(100)
      return true
    }

    if (data.players.length === 1) {
      handleOnExit()
      return true
    }

    mode === "online" && setModalVisible(true)
    mode === "join" && handleOnExit()
    return true
  }

  const handleOnExit = () => {
    setModalVisible(false)
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
          headerLeft: () => <BackIcon size={34} onPress={handleBackPress} />,
          headerRight: () => (
            <CurrentPlayers players={gameData?.players.length} />
          ),
        }}
      />

      <Modal
        animationType="fade"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible)
        }}
        backdropColor={Theme.colors.backdrop}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View>
              <Text
                style={{
                  color: Theme.colors.accent,
                  fontFamily: "OnestBold",
                  fontSize: 18,
                }}
              >
                Close room
              </Text>
            </View>

            <View style={{ marginVertical: 12 }}>
              <Text style={{ fontFamily: "Onest", color: Theme.colors.gray }}>
                Are you sure you wan&apos;t to delete the game? It will kick out
                all the players!
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", gap: 12, alignSelf: "flex-end" }}
            >
              <Pressable
                onPress={() => setModalVisible(false)}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? Theme.colors.background2
                      : Theme.colors.transparent,
                  },
                  styles.modalBottomButtons,
                ]}
              >
                <Text style={{ fontFamily: "Onest", color: Theme.colors.red }}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleOnExit}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? Theme.colors.background2
                      : Theme.colors.transparent,
                  },
                  styles.modalBottomButtons,
                ]}
              >
                <Text
                  style={{ fontFamily: "Onest", color: Theme.colors.accent }}
                >
                  Go!
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
                Time left: {formatTime(timeLeft)}
              </Text>
            </View>
          )}

          <View style={{ flex: 1, flexDirection: "row", gap: 18 }}>
            <View style={styles.columns}>
              <FocusInput
                editable={gameData?.gameStatus === GameStatus.IN_PROGRESS}
                onChange={(text) => setInputs({ ...inputs, name: text })}
                value={inputs.name}
                placeholder="Name"
              />
              <FocusInput
                editable={gameData?.gameStatus === GameStatus.IN_PROGRESS}
                onChange={(text) => setInputs({ ...inputs, country: text })}
                value={inputs.country}
                placeholder="Country"
              />
              <FocusInput
                editable={gameData?.gameStatus === GameStatus.IN_PROGRESS}
                onChange={(text) => setInputs({ ...inputs, animal: text })}
                value={inputs.animal}
                placeholder="Animal"
              />
              <FocusInput
                editable={gameData?.gameStatus === GameStatus.IN_PROGRESS}
                onChange={(text) => setInputs({ ...inputs, food: text })}
                value={inputs.food}
                placeholder="Food"
              />
              <FocusInput
                editable={gameData?.gameStatus === GameStatus.IN_PROGRESS}
                onChange={(text) => setInputs({ ...inputs, object: text })}
                value={inputs.object}
                placeholder="Object"
              />
            </View>

            <View style={styles.columns}>
              <FocusInput
                editable={gameData?.gameStatus === GameStatus.IN_PROGRESS}
                onChange={(text) => setInputs({ ...inputs, lastName: text })}
                value={inputs.lastName}
                placeholder="Last Name"
              />
              <FocusInput
                editable={gameData?.gameStatus === GameStatus.IN_PROGRESS}
                onChange={(text) => setInputs({ ...inputs, color: text })}
                value={inputs.color}
                placeholder="Color"
              />
              <FocusInput
                editable={gameData?.gameStatus === GameStatus.IN_PROGRESS}
                onChange={(text) => setInputs({ ...inputs, artist: text })}
                value={inputs.artist}
                placeholder="Artist"
              />
              <FocusInput
                editable={gameData?.gameStatus === GameStatus.IN_PROGRESS}
                onChange={(text) => setInputs({ ...inputs, fruit: text })}
                value={inputs.fruit}
                placeholder="Fruit"
              />
              <FocusInput
                editable={gameData?.gameStatus === GameStatus.IN_PROGRESS}
                onChange={(text) => setInputs({ ...inputs, profession: text })}
                value={inputs.profession}
                placeholder="Profession"
              />
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
    </Screen>
  )
}

const CurrentPlayers = ({ players = 1 }: { players?: number }) => {
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
