import { Stack } from "expo-router";

export default function PlantsWikiLayout() {
  return (
    <Stack>
      <Stack.Screen name="plant-wiki" options={{ headerShown: false }} />
    </Stack>
  );
}
