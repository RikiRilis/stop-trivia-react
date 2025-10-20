import { SettingsButton } from "@/components/SettingsButton"
import {
  BackIcon,
  CopyIcon,
  LanguageIcon,
  ListIcon,
  LogoutIcon,
  PrivacyIcon,
  UserIcon,
  VibrationIcon,
  WebIcon,
} from "@/components/ui/Icons"
import { Theme } from "@/constants/Theme"
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
  ToastAndroid,
  Vibration,
  View,
} from "react-native"
import { Divider } from "../components/Divider"
import { useStorage } from "@/hooks/useStorage"
import { parseBoolean } from "@/libs/parseBoolean"
import { BottomSheetModal } from "@/components/BottomSheetModal"
import BottomSheet from "@gorhom/bottom-sheet"
import Clipboard from "@react-native-clipboard/clipboard"
import { signOut } from "@react-native-firebase/auth"
import { auth } from "@/libs/firebaseConfig"
import { useTranslation } from "react-i18next"

const languageCodes = ["en", "es"]

export default function Settings() {
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(false)
  const [languageSelected, setLanguageSelected] = useState<string>("en")
  const [userName, setUserName] = useState<string | null | undefined>(
    "Anon-12345678"
  )
  const [userId, setUserId] = useState<string | undefined>(
    "1234567890101112131415"
  )

  const { t, i18n } = useTranslation()
  const { setItem, getItem } = useStorage()

  const sheetRef = useRef<BottomSheet>(null)
  const navigation = useNavigation()

  useEffect(() => {
    const loadSettings = async () => {
      const vibrationValue = await getItem("vibration")
      const languageCode = await getItem("language")

      setIsVibrationEnabled(parseBoolean(vibrationValue))
      setLanguageSelected(languageCode ?? "en")
      setUserId(auth.currentUser?.uid)
      setUserName(auth.currentUser?.displayName)
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

  const toggleLanguage = (code: string) => {
    setLanguageSelected(code)
    setItem("language", code)
    sheetRef.current?.close()
    i18n.changeLanguage(code)
  }

  const copyUserId = () => {
    isVibrationEnabled && Vibration.vibrate(10)
    Clipboard.setString(userId ?? "")
    ToastAndroid.showWithGravity(
      t("copied_clipboard"),
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    )
  }

  const handleSignOut = () => {
    if (auth) {
      signOut(auth)
    }
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
          headerTitle: t("settings"),
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
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 22,
          }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: Theme.colors.primary2,
              padding: 12,
              borderRadius: "100%",
              marginBottom: 4,
            }}
          >
            <UserIcon size={64} color={Theme.colors.accent} />
          </View>

          <Text
            style={{
              color: Theme.colors.accent,
              fontFamily: "OnestBold",
              fontSize: 24,
            }}
          >
            {userName}
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 4,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: Theme.colors.darkGray,
                fontFamily: "Onest",
                fontSize: 12,
              }}
            >
              {userId}
            </Text>

            <Pressable onPress={copyUserId}>
              <CopyIcon color={Theme.colors.darkGray} size={12} />
            </Pressable>
          </View>
        </View>

        <Divider />

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
            <Text style={{ color: Theme.colors.gray }}>{t("vibration")}</Text>
            <Text style={{ color: Theme.colors.darkGray }}>
              {t("vibration_desc")}
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

        <Divider />

        <SettingsButton
          onPress={() => sheetRef.current?.expand()}
          title={t("language")}
          description={languageSelected === "es" ? t("es") : t("en")}
          icon={<LanguageIcon color={Theme.colors.gray} />}
        />

        <Divider />

        <SettingsButton
          onPress={() => Linking.openURL("https://rikirilis.com/privacy")}
          title={t("privacy_policy")}
          description={t("privacy_policy_desc")}
          icon={<PrivacyIcon color={Theme.colors.gray} />}
        />

        <SettingsButton
          onPress={() => Linking.openURL("https://rikirilis.com/terms")}
          title={t("terms_conditions")}
          description={t("terms_conditions_desc")}
          icon={<ListIcon color={Theme.colors.gray} />}
        />

        <SettingsButton
          onPress={() => Linking.openURL("https://rikirilis.com")}
          title={t("site")}
          description={t("site_desc")}
          icon={<WebIcon color={Theme.colors.gray} />}
        />

        <Divider />

        {auth && (
          <SettingsButton
            onPress={handleSignOut}
            title="Sign Out"
            icon={<LogoutIcon color={Theme.colors.red} />}
            color={Theme.colors.red}
          />
        )}
      </ScrollView>

      <BottomSheetModal title={t("language")} ref={sheetRef}>
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
