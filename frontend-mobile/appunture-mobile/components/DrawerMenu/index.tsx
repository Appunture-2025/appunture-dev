import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import styles from './styles';

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  visible,
  onClose,
}) => {
  const menuItems = [
    {
      id: 'map',
      title: 'Mapa Interativo',
      icon: 'map',
      route: '/(tabs)/map',
      description: 'Explore pontos no corpo'
    },
    {
      id: 'favorites',
      title: 'Favoritos',
      icon: 'heart',
      route: '/(tabs)/favorites',
      description: 'Seus pontos salvos'
    },
    {
      id: 'history',
      title: 'Histórico',
      icon: 'history',
      route: '#',
      description: 'Suas sessões anteriores'
    },
    {
      id: 'settings',
      title: 'Configurações',
      icon: 'cog',
      route: '#',
      description: 'Ajustes do aplicativo'
    },
    {
      id: 'help',
      title: 'Ajuda',
      icon: 'question-circle',
      route: '#',
      description: 'Suporte e FAQ'
    },
  ];

  const handleMenuItemPress = (route: string) => {
    onClose();
    if (route !== '#') {
      router.push(route as any);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayBackground} 
          onPress={onClose}
          activeOpacity={1}
          accessibilityLabel="Fechar menu"
          accessibilityHint="Toque para fechar o menu lateral"
          accessibilityRole="button"
        />
        <View style={styles.drawer} accessibilityRole="menu">
          <SafeAreaView style={styles.drawerContent}>
            {/* Header do Menu */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle} accessibilityRole="header">Menu</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
                accessibilityLabel="Fechar menu"
                accessibilityHint="Toque duas vezes para fechar o menu"
                accessibilityRole="button"
              >
                <FontAwesome name="times" size={24} color="#6B7280" accessibilityElementsHidden />
              </TouchableOpacity>
            </View>

            {/* Lista de Itens */}
            <ScrollView 
              style={styles.menuList} 
              showsVerticalScrollIndicator={false}
              accessibilityRole="list"
            >
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(item.route)}
                  accessibilityLabel={`${item.title}. ${item.description}`}
                  accessibilityHint={item.route !== '#' ? "Toque duas vezes para navegar" : "Funcionalidade em desenvolvimento"}
                  accessibilityRole="menuitem"
                >
                  <View style={styles.menuItemIcon} accessibilityElementsHidden>
                    <FontAwesome 
                      name={item.icon as any} 
                      size={20} 
                      color="#3B82F6" 
                    />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemDescription}>{item.description}</Text>
                  </View>
                  <FontAwesome 
                    name="chevron-right" 
                    size={16} 
                    color="#9CA3AF" 
                    accessibilityElementsHidden
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Footer */}
            <View style={styles.drawerFooter}>
              <Text style={styles.footerText} accessibilityRole="text">Appunture v1.0</Text>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};
