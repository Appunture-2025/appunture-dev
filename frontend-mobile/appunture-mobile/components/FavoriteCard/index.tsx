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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onRemove}>
          <FontAwesome name="heart" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.footer}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
        <Text style={styles.date}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
};
