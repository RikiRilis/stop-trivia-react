import React, { useEffect } from "react"
import { StyleSheet } from "react-native"
import { HomeIcon, StatsIcon } from "@/components/ui/Icons"
import { PlatformPressable } from "@react-navigation/elements"
import { Theme } from "@/libs/consts"
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

interface Props {
  onPress: Function
  onLongPress: Function
  isFocused: boolean
  routeName: string
  label: string
}

export const TabBarButton = ({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  label,
}: Props) => {
  const icon = {
    index: (props: any) => <HomeIcon {...props} />,
    stats: (props: any) => <StatsIcon {...props} />,
  }

  const scale = useSharedValue(0)

  useEffect(() => {
    scale.value = withSpring(
      typeof isFocused === "boolean" ? (isFocused ? 1 : 0) : isFocused,
      { duration: 200 }
    )
  }, [scale, isFocused])

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0])
    return { opacity }
  })

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2])
    const top = interpolate(scale.value, [0, 1], [0, 9])
    return { transform: [{ scale: scaleValue }], top: top }
  })

  return (
    <PlatformPressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabbarItem}
    >
      <Animated.View style={animatedIconStyle}>
        {icon[routeName]({
          color: isFocused ? Theme.colors.primary : Theme.colors.darkGray,
        })}
      </Animated.View>
      <Animated.Text
        style={[
          {
            color: isFocused ? Theme.colors.primary : Theme.colors.darkGray,
            textAlign: "center",
            fontSize: 12,
            fontFamily: "Onest",
          },
          animatedTextStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </PlatformPressable>
  )
}

const styles = StyleSheet.create({
  tabbarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
})
