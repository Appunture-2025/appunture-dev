import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderWithMenu, FeatureCard, StatsGrid, QuickActions } from '../../components';

export default function HomeScreen() {

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Atlas Digital de Acupuntura</Text>
          <Text style={styles.heroSubtitle}>
            Consulte pontos de acupuntura com precisão científica
          </Text>
        </View>

        {/* Statistics */}
        <StatsGrid />

        {/* Quick Actions */}
        <QuickActions />

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Recursos Principais</Text>
          
          <FeatureCard
            icon="🗺️"
            title="Mapa Interativo"
            description="Explore pontos de acupuntura em um mapa detalhado do corpo"
          />

          <FeatureCard
            icon="🔍"
            title="Busca por Sintomas"
            description="Encontre pontos específicos para tratar seus sintomas"
          />

          <FeatureCard
            icon="❤️"
            title="Favoritos"
            description="Salve e organize seus pontos de acupuntura favoritos"
          />
        </View>
      </ScrollView>
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
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.02,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
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
});
