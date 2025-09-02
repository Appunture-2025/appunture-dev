import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from './styles';

interface CategoryCardProps {
  icon: string;
  title: string;
  color: string;
  onPress?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  icon,
  title,
  color,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <FontAwesome name={icon as any} size={24} color={color} />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};
