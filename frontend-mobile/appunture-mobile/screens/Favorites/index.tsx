import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { HeaderWithMenu, FavoriteCard } from '../../components';

export default function FavoritesScreen() {

  const favorites = [
    {
      title: 'Baihui (VG20)',
      description: 'Localizado no topo da cabeça. Útil para dores de cabeça, tontura e problemas de memória.',
      tag: 'Dor de Cabeça',
      date: 'Adicionado há 2 dias',
    },
    {
      title: 'Shenmen (C7)',
      description: 'Localizado no punho. Excelente para ansiedade, insônia e problemas emocionais.',
      tag: 'Ansiedade',
      date: 'Adicionado há 1 semana',
    },
    {
      title: 'Zusanli (E36)',
      description: 'Localizado na perna. Fortalece energia vital e melhora a digestão.',
      tag: 'Digestão',
      date: 'Adicionado há 2 semanas',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Meus Favoritos</Text>
        <Text style={styles.subtitle}>
          Aqui estão os pontos de acupuntura que você salvou como favoritos.
        </Text>
        
        <View style={styles.favoritesContainer}>
          {favorites.map((favorite, index) => (
            <FavoriteCard
              key={index}
              title={favorite.title}
              description={favorite.description}
              tag={favorite.tag}
              date={favorite.date}
              onPress={() => console.log('Favorite pressed:', favorite.title)}
              onRemove={() => console.log('Remove favorite:', favorite.title)}
            />
          ))}
        </View>

        {favorites.length === 0 && (
          <View style={styles.emptyState}>
            <FontAwesome name="heart-o" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>Nenhum favorito ainda</Text>
            <Text style={styles.emptyStateText}>
              Adicione pontos aos seus favoritos para acessá-los rapidamente
            </Text>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.02,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  favoritesContainer: {
    marginBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
