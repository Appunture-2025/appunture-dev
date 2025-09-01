import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeIndex() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appunture</Text>
      <Text style={styles.subtitle}>Versão Web Funcionando!</Text>
      <Text style={styles.description}>
        O projeto está rodando corretamente na web.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#007aff",
  },
  subtitle: {
    fontSize: 18,
    color: "#333",
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
