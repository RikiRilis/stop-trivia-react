import { Theme } from "@/constants/Theme"
import React, { useCallback, useState } from "react"
import {
  View,
  Text,
  Vibration,
  Pressable,
  Keyboard,
  ActivityIndicator,
} from "react-native"
import { LinkIcon, OfflineIcon, OnlineIcon } from "@/components/ui/Icons"
import { Screen } from "@/components/ui/Screen"
import { useFocusEffect, useRouter } from "expo-router"
import { useStorage } from "@/hooks/useStorage"
import { parseBoolean } from "@/libs/parseBoolean"
import LottieView from "lottie-react-native"
import ic from "@/assets/lotties/ic_gamepad.json"
import { ModesButton } from "@/components/ModesButton"
import { FocusInput } from "@/components/FocusInput"
import Fire from "@/db/Fire"
import { GameStatus } from "@/interfaces/Game"
import { useTranslation } from "react-i18next"

export default function Index() {
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [id, setId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { navigate } = useRouter()
  const { getItem } = useStorage()
  const { t } = useTranslation()

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        const vibrationValue = await getItem("vibration")
        setVibrationEnabled(parseBoolean(vibrationValue))
      }
      loadSettings()
    }, [])
  )

  const handleCodeChange = (text: string) => {
    setId(text.trim().toLocaleLowerCase())
  }

  const handlePress = (flag: string, time: number = 300) => {
    if (loading) return

    vibrationEnabled && Vibration.vibrate(10)
    setError(null)

    if (flag === "join") {
      setLoading(true)

      if (id.length !== 6) {
        vibrationEnabled && Vibration.vibrate(100)
        setError(t("error_game_invalid_code"))
        setLoading(false)
        return
      }

      id.length === 6 &&
        Fire.getGame("stop", id).then((game) => {
          if (!game) {
            vibrationEnabled && Vibration.vibrate(100)
            setError(t("error_game_not_found"))
            setLoading(false)
            return
          }

          if (game.players.length >= 4) {
            vibrationEnabled && Vibration.vibrate(100)
            setError(t("error_game_full"))
            setLoading(false)
            return
          }

          if (game) {
            if (game.gameStatus === GameStatus.IN_PROGRESS) {
              vibrationEnabled && Vibration.vibrate(100)
              setError(t("error_game_started"))
              setLoading(false)
              return
            }

            setLoading(false)
            setError(null)

            navigate({
              pathname: "stop",
              params: { mode: flag, id: game.gameId, time: game.currentTime },
            })
          }
        })
    }

    if (flag !== "join") {
      navigate({
        pathname: "stop",
        params: { mode: flag, id, time },
      })
    }
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
            {t("choose_your_mode")}
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
            title={t("play_offline")}
            subtitle={t("play_offline_desc")}
            flag="offline"
            onPress={() => handlePress("offline")}
          />
          <ModesButton
            icon={<OnlineIcon size={32} color={Theme.colors.accent} />}
            title={t("play_online")}
            subtitle={t("play_online_desc")}
            flag="online"
            onPress={() => handlePress("online")}
          />
          <ModesButton
            icon={<LinkIcon size={32} color={Theme.colors.accent} />}
            rightIcon={
              loading ? (
                <ActivityIndicator
                  color={Theme.colors.accent}
                  style={{ width: 32, height: 32 }}
                ></ActivityIndicator>
              ) : undefined
            }
            title={t("join_game")}
            flag="join"
            onPress={() => handlePress("join")}
          >
            <FocusInput
              capitalize="none"
              onChange={handleCodeChange}
              placeholder="Code"
              type="default"
            />

            {error && (
              <Text
                style={{
                  color: Theme.colors.red,
                  fontFamily: "Onest",
                  fontSize: 14,
                }}
              >
                {error}
              </Text>
            )}
          </ModesButton>
        </View>
      </Pressable>
    </Screen>
  )
}
