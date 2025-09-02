import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderWithMenu, SearchInput, CategoryCard } from '../../components';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');

  const categories = [
    { icon: 'heart', title: 'Dor de Cabeça', color: '#EF4444' },
    { icon: 'moon-o', title: 'Insônia', color: '#3B82F6' },
    { icon: 'flash', title: 'Estresse', color: '#F59E0B' },
    { icon: 'leaf', title: 'Digestão', color: '#10B981' },
  ];

  const recentSearches = ['Ponto Baihui', 'Dor nas costas', 'Ansiedade'];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SearchInput
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={() => console.log('Searching:', searchText)}
        />

        <Text style={styles.sectionTitle}>Categorias Populares</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              icon={category.icon}
              title={category.title}
              color={category.color}
              onPress={() => console.log('Category pressed:', category.title)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Buscas Recentes</Text>
        <View style={styles.recentSearches}>
          {recentSearches.map((search, index) => (
            <Text key={index} style={styles.recentSearchItem}>
              {search}
            </Text>
          ))}
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
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
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
