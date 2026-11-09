import { useAuth } from "@clerk/expo";
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
} from "@expo-google-fonts/be-vietnam-pro";
import {
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
// Adjust path
import { View } from "react-native";
import { FullScreenLoader } from "../components/FullScreenLoader";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-SemiBold": PlusJakartaSans_600SemiBold,
    "PlusJakartaSans-Bold": PlusJakartaSans_700Bold,
    "PlusJakartaSans-ExtraBold": PlusJakartaSans_800ExtraBold,
    "BeVietnamPro-Regular": BeVietnamPro_400Regular,
    "BeVietnamPro-Medium": BeVietnamPro_500Medium,
    "BeVietnamPro-SemiBold": BeVietnamPro_600SemiBold,
    "BeVietnamPro-Bold": BeVietnamPro_700Bold,
  });

  // If a font fails to load, carry on with the system font
  if (!isLoaded || !(fontsLoaded || fontError)) {
    return <FullScreenLoader />;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000" },
          animation: "fade", 
        }}
      />
    </View>
  );
}
