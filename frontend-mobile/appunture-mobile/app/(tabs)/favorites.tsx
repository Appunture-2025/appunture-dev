import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { Header } from '../../components';

export default function FavoritesScreen() {
  const handleMenuPress = () => {
    console.log('Menu pressionado');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onMenuPress={handleMenuPress} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Seus Pontos Favoritos</Text>
        
        <View style={styles.favoritesContainer}>
          {/* Exemplo de ponto favorito */}
          <TouchableOpacity style={styles.favoriteCard}>
            <View style={styles.favoriteHeader}>
              <Text style={styles.favoriteTitle}>Baihui (VG20)</Text>
              <FontAwesome name="heart" size={20} color="#EF4444" />
            </View>
            <Text style={styles.favoriteDescription}>
              Localizado no topo da cabeça. Útil para dores de cabeça, tontura e problemas de memória.
            </Text>
            <View style={styles.favoriteFooter}>
              <View style={styles.favoriteTag}>
                <Text style={styles.favoriteTagText}>Dor de Cabeça</Text>
              </View>
              <Text style={styles.favoriteDate}>Adicionado há 2 dias</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.favoriteCard}>
            <View style={styles.favoriteHeader}>
              <Text style={styles.favoriteTitle}>Shenmen (C7)</Text>
              <FontAwesome name="heart" size={20} color="#EF4444" />
            </View>
            <Text style={styles.favoriteDescription}>
              Localizado no punho. Excelente para ansiedade, insônia e problemas emocionais.
            </Text>
            <View style={styles.favoriteFooter}>
              <View style={styles.favoriteTag}>
                <Text style={styles.favoriteTagText}>Ansiedade</Text>
              </View>
              <Text style={styles.favoriteDate}>Adicionado há 1 semana</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.favoriteCard}>
            <View style={styles.favoriteHeader}>
              <Text style={styles.favoriteTitle}>Zusanli (E36)</Text>
              <FontAwesome name="heart" size={20} color="#EF4444" />
            </View>
            <Text style={styles.favoriteDescription}>
              Localizado na perna. Fortalece energia vital e melhora a digestão.
            </Text>
            <View style={styles.favoriteFooter}>
              <View style={styles.favoriteTag}>
                <Text style={styles.favoriteTagText}>Digestão</Text>
              </View>
              <Text style={styles.favoriteDate}>Adicionado há 2 semanas</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyState}>
          <FontAwesome name="heart-o" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>
            Adicione pontos aos seus favoritos para acessá-los rapidamente
          </Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    marginLeft: 4,
  },
  favoritesContainer: {
    marginBottom: 32,
  },
  favoriteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoriteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  favoriteDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  favoriteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  favoriteTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
  },
  favoriteDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
});
