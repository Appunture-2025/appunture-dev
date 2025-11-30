import React, { useEffect, ReactNode } from "react";
import { Appearance, useColorScheme, View, StyleSheet } from "react-native";
import { useThemeStore, useThemeColors } from "../stores/themeStore";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const setSystemColorScheme = useThemeStore(
    (state) => state.setSystemColorScheme
  );
  const colors = useThemeColors();

  // Listen to system theme changes
  useEffect(() => {
    setSystemColorScheme(systemColorScheme);
  }, [systemColorScheme, setSystemColorScheme]);

  // Also listen to Appearance changes for more reliable detection
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, [setSystemColorScheme]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ThemeProvider;
