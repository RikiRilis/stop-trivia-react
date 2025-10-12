import { PlatformPressable } from "@react-navigation/elements";
import { ReactElement } from "react";
import { Text, View } from "react-native";
import { Theme } from "@/libs/consts";

interface SettingsButtonProps {
  onPress: () => void;
  title: string;
  description: string;
  icon: ReactElement;
}

export const SettingsButton = ({
  onPress,
  title,
  description,
  icon,
}: SettingsButtonProps) => {
  return (
    <PlatformPressable
      style={{
        flexDirection: "row",
        gap: 12,
        padding: 16,
        alignItems: "center",
        paddingVertical: 16,
      }}
      onPress={onPress}
    >
      <View>{icon}</View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: Theme.colors.gray }}>{title}</Text>
        <Text style={{ color: Theme.colors.darkGray }}>{description}</Text>
      </View>
    </PlatformPressable>
  );
};
