import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import { apiService } from "../../services/api";
import { useThemeColors, useThemeStore } from "../../stores/themeStore";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatBotScreen() {
  const colors = useThemeColors();
  const { isDark } = useThemeStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Olá! Sou seu assistente de acupuntura. Como posso ajudá-lo hoje? Você pode me contar sobre seus sintomas ou fazer perguntas sobre pontos de acupuntura.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const markdownStyles = useMemo(
    () => ({
      body: {
        color: colors.text,
        fontSize: 16,
      },
      paragraph: {
        marginBottom: 10,
      },
      list_item: {
        marginBottom: 5,
      },
    }),
    [colors.text]
  );

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    scrollToBottom();

    try {
      const responseText = await apiService.chatWithAi(userMessage.text);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      scrollToBottom();
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      Alert.alert(
        "Erro",
        "Não foi possível processar sua mensagem. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser
          ? [styles.userMessage, { backgroundColor: colors.primary }]
          : [
              styles.botMessage,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ],
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${
        item.isUser ? "Você disse" : "Assistente disse"
      }: ${item.text}`}
    >
      {item.isUser ? (
        <Text style={styles.userMessageText}>{item.text}</Text>
      ) : (
        <Markdown style={markdownStyles}>{item.text}</Markdown>
      )}
      <Text
        style={[
          styles.timestamp,
          {
            color: item.isUser ? "rgba(255,255,255,0.7)" : colors.textSecondary,
          },
        ]}
      >
        {item.timestamp.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={scrollToBottom}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Digitando...
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, color: colors.text },
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={500}
          editable={!isLoading}
          accessibilityLabel="Campo de mensagem"
          accessibilityHint="Digite sua pergunta aqui"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: colors.primary },
            (!inputText.trim() || isLoading) && [
              styles.sendButtonDisabled,
              { backgroundColor: colors.border },
            ],
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensagem"
          accessibilityState={{ disabled: !inputText.trim() || isLoading }}
        >
          <Ionicons
            name="send"
            size={24}
            color={
              !inputText.trim() || isLoading ? colors.textSecondary : "#fff"
            }
            importantForAccessibility="no-hide-descendants"
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 32,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  botMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  userMessageText: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginLeft: 16,
    marginBottom: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 12,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});
