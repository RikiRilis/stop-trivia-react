import { SettingsButton } from "@/components/SettingsButton"
import {
  BackIcon,
  ListIcon,
  LogoutIcon,
  PrivacyIcon,
  SoundIcon,
  VibrationIcon,
  WebIcon,
} from "@/components/ui/Icons"
import { Theme } from "@/libs/consts"
import { PlatformPressable } from "@react-navigation/elements"
import { Stack, useNavigation } from "expo-router"
import { useEffect, useState } from "react"
import {
  Linking,
  ScrollView,
  Switch,
  Text,
  Vibration,
  View,
} from "react-native"
import { Divider } from "../components/Divider"
import { useStorage } from "@/hooks/useStorage"
import { parseBoolean } from "@/libs/parseBoolean"

export default function Settings() {
  const navigation = useNavigation()
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(false)
  const { setItem, getItem } = useStorage()

  useEffect(() => {
    const loadSettings = async () => {
      const vibrationValue = await getItem("vibration")
      const soundValue = await getItem("sound")

      setIsVibrationEnabled(parseBoolean(vibrationValue))
      setIsSoundEnabled(parseBoolean(soundValue))
    }

    loadSettings()
  }, [])

  const toggleVibrationSwitch = () => {
    setIsVibrationEnabled((prev) => {
      const newValue = !prev
      setItem("vibration", String(newValue))
      if (newValue) Vibration.vibrate(10)
      return newValue
    })
  }

  const toggleSoundSwitch = () => {
    setIsSoundEnabled((prev) => {
      const newValue = !prev
      setItem("sound", String(newValue))
      return newValue
    })
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: Theme.colors.background,

        width: "100%",
      }}
    >
      <Stack.Screen
        options={{
          headerTintColor: Theme.colors.text,
          headerTitle: "Settings",
          headerTitleStyle: {
            fontSize: 24,
            fontFamily: "Onest",
          },
          headerLeft: () => (
            <BackIcon size={34} onPress={() => navigation.goBack()} />
          ),
          headerRight: () => null,
        }}
      />

      <View style={{ flex: 1, width: "100%" }}>
        <PlatformPressable
          style={{
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
            paddingVertical: 16,
            padding: 16,
          }}
          onPress={toggleVibrationSwitch}
        >
          <View>
            <VibrationIcon color={Theme.colors.gray} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: Theme.colors.gray }}>Vibration</Text>
            <Text style={{ color: Theme.colors.darkGray }}>
              Turn on/off haptic vibration using the game.
            </Text>
          </View>

          <View>
            <Switch
              trackColor={{
                false: Theme.colors.darkGray,
                true: Theme.colors.primary2,
              }}
              thumbColor={
                isVibrationEnabled ? Theme.colors.primary : Theme.colors.text
              }
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleVibrationSwitch}
              value={isVibrationEnabled}
            />
          </View>
        </PlatformPressable>

        <PlatformPressable
          style={{
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
            paddingVertical: 16,
            padding: 16,
          }}
          onPress={toggleSoundSwitch}
        >
          <View>
            <SoundIcon color={Theme.colors.gray} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: Theme.colors.gray }}>Sound</Text>
            <Text style={{ color: Theme.colors.darkGray }}>
              Turn on/off haptic sound using the game.
            </Text>
          </View>

          <View>
            <Switch
              trackColor={{
                false: Theme.colors.darkGray,
                true: Theme.colors.primary2,
              }}
              thumbColor={
                isSoundEnabled ? Theme.colors.primary : Theme.colors.text
              }
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSoundSwitch}
              value={isSoundEnabled}
            />
          </View>
        </PlatformPressable>

        <Divider />

        <SettingsButton
          onPress={() => Linking.openURL("https://rikirilis.com/privacy")}
          title="Privacy Policy"
          description="Read our privacy policy."
          icon={<PrivacyIcon color={Theme.colors.gray} />}
        />

        <SettingsButton
          onPress={() => Linking.openURL("https://rikirilis.com/terms")}
          title="Terms & Conditions"
          description="Read our Terms & Conditions."
          icon={<ListIcon color={Theme.colors.gray} />}
        />

        <SettingsButton
          onPress={() => Linking.openURL("https://rikirilis.com")}
          title="Site"
          description="Visit the creator's"
          icon={<WebIcon color={Theme.colors.gray} />}
        />

        <Divider />

        <PlatformPressable
          style={{
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
            padding: 16,
            paddingVertical: 16,
          }}
          onPress={() => {}}
        >
          <View>
            <LogoutIcon color={Theme.colors.red} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: Theme.colors.red }}>Sign Out</Text>
          </View>
        </PlatformPressable>
      </View>
    </ScrollView>
  )
}
