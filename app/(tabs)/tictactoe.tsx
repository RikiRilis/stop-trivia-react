import { Screen } from "@/components/ui/Screen"
import { Text, View } from "react-native"
import { Theme } from "@/constants/Theme"

export default function TicTacToe() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            color: Theme.colors.gray,
            fontFamily: Theme.fonts.onestBold,
            fontSize: 32,
          }}
        >
          Coming soon...
        </Text>
      </View>
    </Screen>
  )
}
