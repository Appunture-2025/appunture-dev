import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import styles from './styles';

interface HeaderButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

export const NotificationButton: React.FC<HeaderButtonProps> = ({ 
  onPress, 
  color = '#1F2937', 
  size = 20 
}) => (
  <TouchableOpacity 
    style={styles.button} 
    onPress={onPress}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    accessibilityLabel="Notificações"
    accessibilityHint="Toque duas vezes para ver suas notificações"
    accessibilityRole="button"
  >
    <FontAwesome name="bell" size={size} color={color} accessibilityElementsHidden />
    <View style={styles.badge} accessibilityElementsHidden>
      <View style={styles.badgeDot} />
    </View>
  </TouchableOpacity>
);

export const SearchButton: React.FC<HeaderButtonProps> = ({ 
  onPress, 
  color = '#1F2937', 
  size = 20 
}) => (
  <TouchableOpacity 
    style={styles.button} 
    onPress={onPress}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    accessibilityLabel="Buscar"
    accessibilityHint="Toque duas vezes para abrir a busca"
    accessibilityRole="button"
  >
    <FontAwesome name="search" size={size} color={color} accessibilityElementsHidden />
  </TouchableOpacity>
);

export const SettingsButton: React.FC<HeaderButtonProps> = ({ 
  onPress, 
  color = '#1F2937', 
  size = 20 
}) => (
  <TouchableOpacity 
    style={styles.button} 
    onPress={onPress}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    accessibilityLabel="Configurações"
    accessibilityHint="Toque duas vezes para abrir as configurações"
    accessibilityRole="button"
  >
    <FontAwesome name="cog" size={size} color={color} accessibilityElementsHidden />
  </TouchableOpacity>
);

export const FavoriteButton: React.FC<HeaderButtonProps & { isFavorite?: boolean }> = ({ 
  onPress, 
  color = '#1F2937', 
  size = 20,
  isFavorite = false 
}) => (
  <TouchableOpacity 
    style={styles.button} 
    onPress={onPress}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    accessibilityLabel={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    accessibilityHint={isFavorite ? "Toque duas vezes para remover dos favoritos" : "Toque duas vezes para adicionar aos favoritos"}
    accessibilityRole="button"
    accessibilityState={{ selected: isFavorite }}
  >
    <FontAwesome 
      name={isFavorite ? "heart" : "heart-o"} 
      size={size} 
      color={isFavorite ? "#EF4444" : color} 
      accessibilityElementsHidden
    />
  </TouchableOpacity>
);
