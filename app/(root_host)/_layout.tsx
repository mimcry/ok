
import { Redirect, router, Stack } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Platform, TouchableOpacity,Text } from "react-native";

export default function Layout() {

  
  return (
    <Stack>
      <Stack.Screen name="(profile)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
     </Stack>
  );
}