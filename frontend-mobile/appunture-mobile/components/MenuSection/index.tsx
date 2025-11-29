import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from './styles';

interface MenuItem {
  icon: string;
  title: string;
  onPress?: () => void;
}

interface MenuSectionProps {
  items: MenuItem[];
}

export const MenuSection: React.FC<MenuSectionProps> = ({ items }) => {
  return (
    <View style={styles.container} accessibilityRole="list">
      {items.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={[
            styles.menuItem,
            index === items.length - 1 && styles.lastMenuItem
          ]} 
          onPress={item.onPress}
          activeOpacity={0.7}
          accessibilityLabel={item.title}
          accessibilityHint="Toque duas vezes para acessar esta opção"
          accessibilityRole="menuitem"
        >
          <View style={styles.menuItemLeft} accessibilityElementsHidden>
            <FontAwesome name={item.icon as any} size={20} color="#6B7280" />
            <Text style={styles.menuItemText}>{item.title}</Text>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#6B7280" accessibilityElementsHidden />
        </TouchableOpacity>
      ))}
    </View>
  );
};
