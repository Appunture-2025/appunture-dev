import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Logo } from '../Logo';
import styles from './styles';

interface HeaderProps {
  onMenuPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuPress,
}) => {
  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    }
  };

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      <SafeAreaView style={styles.container} accessibilityRole="header">
        <View style={styles.header}>
          {/* Logo e Nome do App */}
          <View style={styles.logoContainer} accessibilityLabel="Appunture - Logo">
            <Logo size="small" showText={false} />
            <Text style={styles.appName}>Appunture</Text>
          </View>

          {/* Menu Hambúrguer */}
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={handleMenuPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Abrir menu de navegação"
            accessibilityHint="Toque duas vezes para abrir o menu lateral"
            accessibilityRole="button"
          >
            <FontAwesome 
              name="bars" 
              size={24} 
              color="#1F2937" 
              accessibilityElementsHidden
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};
