import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from './styles';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      icon: 'map',
      title: 'Mapa do Corpo',
      subtitle: 'Explore pontos interativos',
      color: '#007AFF',
    },
    {
      icon: 'search',
      title: 'Buscar Sintomas',
      subtitle: 'Encontre pontos específicos',
      color: '#34C759',
    },
  ];

  return (
    <View style={styles.container} accessibilityRole="list">
      {actions.map((action, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.actionCard} 
          activeOpacity={0.7}
          accessibilityLabel={`${action.title}. ${action.subtitle}`}
          accessibilityHint="Toque duas vezes para acessar este recurso"
          accessibilityRole="button"
        >
          <View 
            style={[styles.iconContainer, { backgroundColor: `${action.color}15` }]}
            accessibilityElementsHidden
          >
            <FontAwesome name={action.icon as any} size={24} color={action.color} />
          </View>
          <Text style={styles.actionTitle}>{action.title}</Text>
          <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
