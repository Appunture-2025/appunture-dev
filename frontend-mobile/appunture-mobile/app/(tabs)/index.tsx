import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Appunture!</Text>
      <View style={styles.separator} />
      <Text style={styles.subtitle}>Tela principal do aplicativo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: '#E5E7EB',
  },
});
