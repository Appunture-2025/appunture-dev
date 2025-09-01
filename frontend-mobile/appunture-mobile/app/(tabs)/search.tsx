import React from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { Header } from '../../components';

export default function SearchScreen() {
  const handleMenuPress = () => {
    console.log('Menu pressionado');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onMenuPress={handleMenuPress} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <FontAwesome name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar pontos de acupuntura, sintomas..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Categorias Populares</Text>
        <View style={styles.categoriesContainer}>
          <View style={styles.categoryCard}>
            <FontAwesome name="heart" size={24} color="#EF4444" />
            <Text style={styles.categoryText}>Dor de Cabeça</Text>
          </View>
          <View style={styles.categoryCard}>
            <FontAwesome name="moon-o" size={24} color="#3B82F6" />
            <Text style={styles.categoryText}>Insônia</Text>
          </View>
          <View style={styles.categoryCard}>
            <FontAwesome name="flash" size={24} color="#F59E0B" />
            <Text style={styles.categoryText}>Estresse</Text>
          </View>
          <View style={styles.categoryCard}>
            <FontAwesome name="leaf" size={24} color="#10B981" />
            <Text style={styles.categoryText}>Digestão</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Buscas Recentes</Text>
        <View style={styles.recentSearches}>
          <Text style={styles.recentSearchItem}>Ponto Baihui</Text>
          <Text style={styles.recentSearchItem}>Dor nas costas</Text>
          <Text style={styles.recentSearchItem}>Ansiedade</Text>
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
  searchContainer: {
    marginBottom: 30,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
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
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    marginLeft: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
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
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  recentSearches: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
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
  recentSearchItem: {
    fontSize: 16,
    color: '#6B7280',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
});
