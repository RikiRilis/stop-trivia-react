import { View, StyleSheet, LayoutChangeEvent, Vibration } from "react-native"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { Theme } from "@/libs/consts"
import { TabBarButton } from "../TabBarButton"
import { useState } from "react"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [dimensions, setDimensions] = useState({ height: 20, width: 100 })
  const buttonWidth = dimensions.width / state.routes.length

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    })
  }

  const tabPositionX = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }],
    }
  })

  return (
    <View onLayout={onTabbarLayout} style={styles.tabbar}>
      <Animated.View
        style={[
          animatedStyle,
          {
            position: "absolute",
            backgroundColor: Theme.colors.primary2,
            borderRadius: 30,
            marginHorizontal: 12,
            height: dimensions.height - 15,
            width: buttonWidth - 25,
          },
        ]}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name

        const isFocused = state.index === index

        const onPress = () => {
          Vibration.vibrate(10)
          tabPositionX.value = withSpring(buttonWidth * index, {
            duration: 500,
          })

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params)
          }
        }

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          })
        }

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? Theme.colors.primary : Theme.colors.darkGray}
            label={label}
          />

          //   <PlatformPressable
          //     key={route.name}
          //     href={buildHref(route.name, route.params)}
          //     accessibilityState={isFocused ? { selected: true } : {}}
          //     accessibilityLabel={options.tabBarAccessibilityLabel}
          //     testID={options.tabBarButtonTestID}
          //     onPress={onPress}
          //     onLongPress={onLongPress}
          //     style={styles.tabbarItem}
          //   >
          //     {icon[route.name]({
          //       color: isFocused ? Theme.colors.primary : Theme.colors.darkGray,
          //     })}
          //     <Text
          //       style={{
          //         color: isFocused ? Theme.colors.primary : Theme.colors.darkGray,
          //         textAlign: "center",
          //       }}
          //     >
          //       {label}
          //     </Text>
          //   </PlatformPressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  tabbar: {
    position: "absolute",
    bottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Theme.colors.background2,
    marginHorizontal: 100,
    paddingVertical: 8,
    borderRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  //   tabbarItem: {
  //     flex: 1,
  //     justifyContent: "center",
  //     alignItems: "center",
  //     gap: 4,
  //   },
})
