import { Theme } from "@/constants/Theme"
import { View } from "react-native"

export const Divider = () => {
  return (
    <View
      style={{
        width: "100%",
        height: 0.4,
        backgroundColor: Theme.colors.darkGray,
      }}
    />
  )
}
