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
  >
    <FontAwesome name="bell" size={size} color={color} />
    <View style={styles.badge}>
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
  >
    <FontAwesome name="search" size={size} color={color} />
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
  >
    <FontAwesome name="cog" size={size} color={color} />
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
  >
    <FontAwesome 
      name={isFavorite ? "heart" : "heart-o"} 
      size={size} 
      color={isFavorite ? "#EF4444" : color} 
    />
  </TouchableOpacity>
);
