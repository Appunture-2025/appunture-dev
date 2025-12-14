import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to the home screen (tabs)
  return <Redirect href="/(tabs)" />;
}
