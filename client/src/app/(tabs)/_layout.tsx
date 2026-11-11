import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ColorValue, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS } from "@/constants/theme";
import { useAccountSync } from "@/hooks/useAccountSync";

/** Rendered only once signed in, so its API calls are authenticated. */
const AccountSync = () => {
  useAccountSync();
  return null;
};

const TabIcon = ({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof MaterialIcons>["name"];
  color: ColorValue;
  focused: boolean;
}) => (
  <View
    style={{
      width: 64,
      height: 32,
      borderRadius: 16,
      backgroundColor: focused ? COLORS.primarySoft : "transparent",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <MaterialIcons name={name} size={24} color={color} />
  </View>
);

const TabsLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const insets = useSafeAreaInsets();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <>
    <AccountSync />
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.placeholder,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          elevation: 0,
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom || 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.semiBold,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: "Activities",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="directions-run" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
    </>
  );
};

export default TabsLayout;
