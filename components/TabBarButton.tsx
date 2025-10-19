import React, { useEffect } from "react"
import { StyleSheet } from "react-native"
import { HomeIcon, HashIcon } from "@/components/ui/Icons"
import { PlatformPressable } from "@react-navigation/elements"
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

interface Props {
  onPress: () => void
  onLongPress: () => void
  isFocused: boolean
  routeName: string
  label: string
  color: string
}

export const TabBarButton = ({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  label,
  color,
}: Props) => {
  const icon = {
    index: (props: any) => <HomeIcon {...props} />,
    tictactoe: (props: any) => <HashIcon {...props} />,
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
          color: color,
        })}
      </Animated.View>
      <Animated.Text
        style={[
          {
            color: color,
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
