import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  onPress?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
};
