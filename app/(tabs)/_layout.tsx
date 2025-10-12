import { Tabs } from "expo-router";
import { HomeIcon, StatsIcon } from "@/components/ui/Icons";
import { Theme } from "@/libs/consts";
import { TabBar } from "@/components/ui/TabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.text,
        tabBarStyle: {
          backgroundColor: Theme.colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          title: "Home",
          tabBarActiveTintColor: Theme.colors.primary,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ color }) => <StatsIcon color={color} />,
          title: "Stats",
          tabBarActiveTintColor: Theme.colors.primary,
        }}
      />
    </Tabs>
  );
}
