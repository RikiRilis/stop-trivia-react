import { Theme } from "@/constants/Theme"
import { Pressable, View, Text, StyleSheet } from "react-native"
import { ForwardIcon } from "@/components/ui/Icons"
import React, { ReactElement } from "react"

interface Props {
  children?: React.ReactNode
  icon: ReactElement
  rightIcon?: ReactElement | undefined
  title: string
  subtitle?: string
  flag: string
  onPress: (flag: string) => void
}

export const ModesButton = ({
  children,
  icon,
  rightIcon,
  title,
  subtitle,
  flag,
  onPress,
}: Props) => {
  return (
    <Pressable
      onPress={() => onPress(flag)}
      style={({ pressed }) => [
        {
          backgroundColor: pressed
            ? Theme.colors.background2
            : Theme.colors.primary2,
        },
        styles.pressables,
      ]}
    >
      {icon}

      <View style={{ flex: 1, gap: subtitle ? 0 : 12 }}>
        <Text
          style={{
            color: Theme.colors.text,
            fontSize: 20,
            fontFamily: Theme.fonts.onestBold,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              color: Theme.colors.gray,
              fontSize: 14,
              fontFamily: Theme.fonts.onest,
            }}
          >
            {subtitle}
          </Text>
        )}

        {children}
      </View>

      {rightIcon ? (
        rightIcon
      ) : (
        <ForwardIcon size={32} color={Theme.colors.accent} />
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressables: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
  },
})
