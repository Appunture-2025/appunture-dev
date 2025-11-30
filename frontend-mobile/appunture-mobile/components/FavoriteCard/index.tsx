import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from './styles';

interface FavoriteCardProps {
  title: string;
  description: string;
  tag: string;
  date: string;
  onPress?: () => void;
  onRemove?: () => void;
}

export const FavoriteCard: React.FC<FavoriteCardProps> = ({
  title,
  description,
  tag,
  date,
  onPress,
  onRemove,
}) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.7}
      accessibilityLabel={`${title}. ${description}. Categoria: ${tag}. ${date}`}
      accessibilityHint="Toque duas vezes para ver detalhes do ponto"
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity 
          onPress={onRemove}
          accessibilityLabel={`Remover ${title} dos favoritos`}
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="heart" size={20} color="#EF4444" accessibilityElementsHidden />
        </TouchableOpacity>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.footer}>
        <View style={styles.tag} accessibilityLabel={`Categoria: ${tag}`}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
        <Text style={styles.date}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
};
