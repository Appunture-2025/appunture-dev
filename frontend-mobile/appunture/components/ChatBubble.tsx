import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../stores/themeStore";
import { COLORS } from "../utils/constants";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  onLongPress?: () => void;
}

export function ChatBubble({
  message,
  isUser,
  timestamp,
  onLongPress,
}: ChatBubbleProps) {
  const colors = useThemeColors();
  const formattedTime = timestamp.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.botContainer,
      ]}
      onLongPress={onLongPress}
      delayLongPress={500}
      accessibilityRole="text"
      accessibilityLabel={`${
        isUser ? "Você" : "Assistente"
      } disse: ${message}. Enviado às ${formattedTime}`}
      accessibilityHint={
        onLongPress ? "Pressione e segure para mais opções" : undefined
      }
    >
      {!isUser && (
        <View
          style={[styles.botAvatar, { backgroundColor: colors.background }]}
          accessibilityElementsHidden
        >
          <Ionicons name="medical" size={16} color={colors.primary} />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.primary }]
            : [
                styles.botBubble,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ],
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isUser ? colors.surface : colors.text },
          ]}
        >
          {message}
        </Text>
        <Text
          style={[
            styles.timestamp,
            {
              color: isUser ? colors.surface : colors.textSecondary,
              opacity: isUser ? 0.8 : 1,
            },
          ]}
          accessibilityElementsHidden
        >
          {formattedTime}
        </Text>
      </View>

      {isUser && (
        <View
          style={[styles.userAvatar, { backgroundColor: colors.primary }]}
          accessibilityElementsHidden
        >
          <Ionicons name="person" size={16} color={colors.surface} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  botContainer: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
    marginLeft: 8,
  },
  botBubble: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
    marginRight: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  userText: {
    color: COLORS.surface,
  },
  botText: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
    alignSelf: "flex-end",
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    alignSelf: "flex-end",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    alignSelf: "flex-end",
  },
});

export default ChatBubble;
