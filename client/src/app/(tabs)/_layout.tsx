import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_COLOR = "#006944";

const TabIcon = ({
  name,
  color,
  size,
  focused,
}: {
  name: React.ComponentProps<typeof MaterialIcons>["name"];
  color: string;
  size: number;
  focused: boolean;
}) => (
  <View
    style={{
      width: 64,
      height: 36,
      borderRadius: 16,
      backgroundColor: focused ? "rgba(0, 105, 68, 0.12)" : "transparent",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <MaterialIcons name={name} size={size} color={color} />
  </View>
);

const TabsLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const insets = useSafeAreaInsets();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BRAND_COLOR,
        tabBarInactiveTintColor: "rgba(43, 48, 47, 0.4)",
        tabBarStyle: {
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.07,
          shadowRadius: 20,
          height: 66 + insets.bottom,
          paddingBottom: insets.bottom || 8,
          paddingTop: 8,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.5,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="home" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: "Activities",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name="bar-chart"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "Settings",
          headerShown: true,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name="settings"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
