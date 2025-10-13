import React, { useState, useRef, useEffect } from "react"
import { Animated, TextInput, StyleSheet } from "react-native"
import { Theme } from "@/libs/consts"

interface FocusInputProps {
  placeholder: string
}

export const FocusInput = ({ placeholder }: FocusInputProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const borderAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start()
  }, [isFocused, borderAnim])

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", Theme.colors.accent],
  })

  const borderWidth = borderAnim.interpolate({
    inputRange: [0, 0],
    outputRange: [0, 1],
  })

  return (
    <Animated.View
      style={[
        styles.inputContainer,
        {
          borderColor,
          borderWidth,
        },
      ]}
    >
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={Theme.colors.darkGray}
        keyboardType="default"
        cursorColor={Theme.colors.accent}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.input}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  inputContainer: {
    borderRadius: 12,
    backgroundColor: Theme.colors.background2,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    color: Theme.colors.text,
    fontFamily: "Onest",
    fontSize: 16,
  },
})
