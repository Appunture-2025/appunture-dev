import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

export const StatsGrid: React.FC = () => {
  const stats = [
    { value: '360+', label: 'Pontos' },
    { value: '14', label: 'Meridianos' },
    { value: '100+', label: 'Sintomas' },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statItem}>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};
