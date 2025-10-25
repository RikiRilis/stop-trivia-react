import { Theme } from "@/constants/Theme"
import { KeyboardAvoidingView, Platform, View } from "react-native"

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: Theme.colors.background,
          padding: 16,
          width: "100%",
        }}
      >
        {children}
      </View>
    </KeyboardAvoidingView>
  )
}
