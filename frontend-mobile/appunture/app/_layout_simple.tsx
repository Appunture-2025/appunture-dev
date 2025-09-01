import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="body-map"
          options={{
            title: "Mapa Corporal",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="point-details"
          options={{
            title: "Detalhes do Ponto",
            headerBackTitle: "Voltar",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
