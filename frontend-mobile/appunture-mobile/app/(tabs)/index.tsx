import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Header } from '@/components';

export default function HomeScreen() {
  const handleMenuPress = () => {
    console.log('Menu pressionado');
  };

  return (
    <View style={styles.container}>
      <Header onMenuPress={handleMenuPress} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.title}>Bem-vindo ao Appunture!</Text>
          <Text style={styles.subtitle}>
            Descubra o poder da acupuntura através de pontos precisos no corpo humano
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Recursos Principais</Text>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>🗺️ Mapa Interativo</Text>
            <Text style={styles.featureDescription}>
              Explore pontos de acupuntura em um mapa detalhado do corpo
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>🔍 Busca por Sintomas</Text>
            <Text style={styles.featureDescription}>
              Encontre pontos específicos para tratar seus sintomas
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>❤️ Favoritos</Text>
            <Text style={styles.featureDescription}>
              Salve e organize seus pontos de acupuntura favoritos
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
  },
  welcomeContainer: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
