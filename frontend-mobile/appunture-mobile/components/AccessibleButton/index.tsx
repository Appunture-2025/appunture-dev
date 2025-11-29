import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface AccessibleButtonProps {
  onPress: () => void;
  label: string;
  hint?: string;
  disabled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * AccessibleButton - A reusable accessible button component
 * 
 * This component ensures all touchable elements have proper accessibility attributes
 * for screen readers (VoiceOver on iOS, TalkBack on Android).
 * 
 * @param onPress - Function to call when button is pressed
 * @param label - Accessibility label describing the button action
 * @param hint - Optional accessibility hint providing additional context
 * @param disabled - Whether the button is disabled
 * @param children - Child elements to render inside the button
 * @param style - Optional additional styles
 */
export function AccessibleButton({
  onPress,
  label,
  hint,
  disabled = false,
  children,
  style,
}: AccessibleButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style]}
      activeOpacity={0.7}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccessibleButton;
