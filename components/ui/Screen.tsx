import { Theme } from "@/libs/consts"
import { View } from "react-native"

export function Screen({ children }: { children: React.ReactNode }) {
  return (
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
  )
}
