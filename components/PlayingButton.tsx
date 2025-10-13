import { Theme } from "@/libs/consts"
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
          backgroundColor: pressed
            ? Theme.colors.background2
            : Theme.colors.primary2,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: "flex-start",
  },
})
