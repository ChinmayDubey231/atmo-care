import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
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
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

/** Never show one account's cached data to the next person who signs in. */
function ClearCacheOnUserChange() {
  const { userId, isLoaded } = useAuth();
  const previous = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!isLoaded) return;
    if (previous.current !== undefined && previous.current !== userId) {
      queryClient.clear();
    }
    previous.current = userId ?? null;
  }, [userId, isLoaded]);
  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-SemiBold": PlusJakartaSans_600SemiBold,
    "PlusJakartaSans-Bold": PlusJakartaSans_700Bold,
    "PlusJakartaSans-ExtraBold": PlusJakartaSans_800ExtraBold,
    "BeVietnamPro-Regular": BeVietnamPro_400Regular,
    "BeVietnamPro-Medium": BeVietnamPro_500Medium,
    "BeVietnamPro-SemiBold": BeVietnamPro_600SemiBold,
    "BeVietnamPro-Bold": BeVietnamPro_700Bold,
  });

  // Refetch stale data (AQI, stats) when the app comes back to the foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) =>
      focusManager.setFocused(state === "active"),
    );
    return () => sub.remove();
  }, []);

  // If a font fails to load, carry on with the system font
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <QueryClientProvider client={queryClient}>
          <ClearCacheOnUserChange />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </QueryClientProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
