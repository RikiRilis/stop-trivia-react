import { Theme } from "@/libs/consts";
import { View } from "react-native";

export const Divider = () => {
  return (
    <View
      style={{
        width: "100%",
        height: 0.3,
        backgroundColor: Theme.colors.darkGray,
      }}
    />
  );
};
