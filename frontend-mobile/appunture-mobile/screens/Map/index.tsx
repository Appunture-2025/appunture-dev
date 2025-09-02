import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderWithMenu } from '../../components';

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      
      <View style={styles.content}>
        <Text style={styles.title}>🗺️ Mapa Interativo</Text>
        <View style={styles.separator} />
        <Text style={styles.subtitle}>
          Explore pontos de acupuntura no corpo humano
        </Text>
        
        <View style={styles.mapPlaceholder}>
          <Text style={styles.placeholderText}>
            Aqui será implementado o mapa interativo do corpo
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
    marginBottom: 40,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: '#E5E7EB',
  },
  mapPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
