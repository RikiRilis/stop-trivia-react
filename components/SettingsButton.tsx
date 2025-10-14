import { ReactElement } from "react"
import { StyleSheet, Text, View, Pressable } from "react-native"
import { Theme } from "@/libs/consts"

interface SettingsButtonProps {
  onPress: () => void
  title: string
  description?: string
  icon: ReactElement
  color?: string
}

export const SettingsButton = ({
  onPress,
  title,
  description,
  icon,
  color,
}: SettingsButtonProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: pressed
            ? Theme.colors.background2
            : Theme.colors.transparent,
        },
        styles.pressable,
      ]}
      onPress={onPress}
    >
      <View>{icon}</View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: color ? color : Theme.colors.gray }}>
          {title}
        </Text>
        {description && (
          <Text style={{ color: Theme.colors.darkGray }}>{description}</Text>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressable: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    alignItems: "center",
    paddingVertical: 16,
  },
})
