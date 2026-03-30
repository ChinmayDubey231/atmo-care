import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
// Adjust path
import { View } from "react-native";
import { FullScreenLoader } from "../components/FullScreenLoader";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
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
