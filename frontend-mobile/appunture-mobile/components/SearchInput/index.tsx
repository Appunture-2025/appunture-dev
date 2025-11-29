import React from 'react';
import { View, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from './styles';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Buscar pontos de acupuntura, sintomas...",
  value,
  onChangeText,
  onSubmitEditing,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <FontAwesome 
          name="search" 
          size={20} 
          color="#6B7280" 
          style={styles.icon} 
          accessibilityElementsHidden
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
          accessibilityLabel="Campo de busca"
          accessibilityHint="Digite para buscar pontos de acupuntura ou sintomas"
        />
      </View>
    </View>
  );
};
