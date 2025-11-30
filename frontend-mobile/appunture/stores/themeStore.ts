import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, ColorSchemeName } from "react-native";
import { COLORS, DARK_COLORS } from "../utils/constants";

export type ThemeMode = "light" | "dark" | "system";

export type ThemeColors = typeof COLORS;

interface ThemeState {
  mode: ThemeMode;
  systemColorScheme: ColorSchemeName;
  colors: ThemeColors;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  setSystemColorScheme: (scheme: ColorSchemeName) => void;
  toggleTheme: () => void;
}

const getEffectiveColors = (
  mode: ThemeMode,
  systemColorScheme: ColorSchemeName
): { colors: ThemeColors; isDark: boolean } => {
  let isDark: boolean;

  if (mode === "system") {
    isDark = systemColorScheme === "dark";
  } else {
    isDark = mode === "dark";
  }

  return {
    colors: isDark ? DARK_COLORS : COLORS,
    isDark,
  };
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "system" as ThemeMode,
      systemColorScheme: Appearance.getColorScheme(),
      ...getEffectiveColors("system", Appearance.getColorScheme()),

      setMode: (mode: ThemeMode) => {
        const { systemColorScheme } = get();
        const { colors, isDark } = getEffectiveColors(mode, systemColorScheme);
        set({ mode, colors, isDark });
      },

      setSystemColorScheme: (scheme: ColorSchemeName) => {
        const { mode } = get();
        const { colors, isDark } = getEffectiveColors(mode, scheme);
        set({ systemColorScheme: scheme, colors, isDark });
      },

      toggleTheme: () => {
        const { mode, systemColorScheme } = get();
        let newMode: ThemeMode;

        if (mode === "system") {
          // If system, switch to opposite of current system theme
          newMode = systemColorScheme === "dark" ? "light" : "dark";
        } else if (mode === "light") {
          newMode = "dark";
        } else {
          newMode = "light";
        }

        const { colors, isDark } = getEffectiveColors(
          newMode,
          systemColorScheme
        );
        set({ mode: newMode, colors, isDark });
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recalculate colors after rehydration
          const systemColorScheme = Appearance.getColorScheme();
          const { colors, isDark } = getEffectiveColors(
            state.mode,
            systemColorScheme
          );
          state.systemColorScheme = systemColorScheme;
          state.colors = colors;
          state.isDark = isDark;
        }
      },
    }
  )
);

// Hook to get current theme colors (convenience)
export const useThemeColors = () => {
  return useThemeStore((state) => state.colors);
};

// Hook to check if dark mode is active
export const useIsDarkMode = () => {
  return useThemeStore((state) => state.isDark);
};
