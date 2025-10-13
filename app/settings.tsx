import { SettingsButton } from "@/components/SettingsButton"
import {
  BackIcon,
  LanguageIcon,
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
import { useEffect, useRef, useState } from "react"
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  Vibration,
  View,
} from "react-native"
import { Divider } from "../components/Divider"
import { useStorage } from "@/hooks/useStorage"
import { parseBoolean } from "@/libs/parseBoolean"
import { BottomSheetModal } from "@/components/BottomSheetModal"
import BottomSheet from "@gorhom/bottom-sheet"

const languageCodes = ["en", "es"]

export default function Settings() {
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(false)
  const [languageSelected, setLanguageSelected] = useState<string>("en")
  const { setItem, getItem } = useStorage()

  const sheetRef = useRef<BottomSheet>(null)
  const navigation = useNavigation()

  useEffect(() => {
    const loadSettings = async () => {
      const vibrationValue = await getItem("vibration")
      const soundValue = await getItem("sound")
      const languageCode = await getItem("language")

      setIsVibrationEnabled(parseBoolean(vibrationValue))
      setIsSoundEnabled(parseBoolean(soundValue))
      setLanguageSelected(languageCode ?? "en")
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

  const toggleLanguage = (code: string) => {
    setLanguageSelected(code)
    setItem("language", code)
  }

  return (
    <View
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

      <ScrollView style={{ flex: 1 }}>
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
          onPress={() => sheetRef.current?.expand()}
          title="Language"
          description={languageSelected === "es" ? "Spanish" : "English"}
          icon={<LanguageIcon color={Theme.colors.gray} />}
        />

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
          description="Visit the creator's website."
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
      </ScrollView>

      <BottomSheetModal title="Language" ref={sheetRef}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          {languageCodes.map((option) => {
            const isSelected = languageSelected === option
            return (
              <Pressable
                key={option}
                style={styles.optionContainer}
                onPress={() => toggleLanguage(option)}
              >
                <View
                  style={[
                    styles.outerCircle,
                    {
                      borderColor: isSelected
                        ? Theme.colors.primary
                        : Theme.colors.gray,
                    },
                  ]}
                >
                  {isSelected && <View style={styles.innerDot} />}
                </View>

                <View>
                  <Text style={styles.optionText}>
                    {option === "es" ? "Spanish" : "English"}
                  </Text>
                  <Text style={styles.optionSubText}>
                    {option === "es" ? "Español" : "Inglés"}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </View>
      </BottomSheetModal>
    </View>
  )
}

const styles = StyleSheet.create({
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 24,
  },
  outerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: Theme.colors.text,
  },
  optionSubText: {
    fontSize: 12,
    color: Theme.colors.gray,
  },
})
