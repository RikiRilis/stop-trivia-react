import { Theme } from "@/constants/Theme"
import { ReactElement } from "react"
import { Pressable, StyleSheet } from "react-native"

interface Props {
  icon: ReactElement
  onPress: (flag: string) => void
  flag: string
}

export const PlayingButton = ({ icon, onPress, flag }: Props) => {
  return (
    <Pressable
      onPress={() => onPress(flag)}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.6 : 1,
        },
        styles.buttons,
      ]}
    >
      {icon}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  buttons: {
    backgroundColor: Theme.colors.primary2,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: "flex-start",
  },
})
