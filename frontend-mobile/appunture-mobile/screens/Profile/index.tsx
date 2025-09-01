import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { HeaderWithMenu, ProfileHeader, MenuSection } from '../../components';

export default function ProfileScreen() {

  const menuItems = [
    { icon: 'user', title: 'Editar Perfil', onPress: () => console.log('Edit Profile') },
    { icon: 'bell', title: 'Notificações', onPress: () => console.log('Notifications') },
    { icon: 'shield', title: 'Privacidade', onPress: () => console.log('Privacy') },
    { icon: 'question-circle', title: 'Ajuda', onPress: () => console.log('Help') },
    { icon: 'info-circle', title: 'Sobre', onPress: () => console.log('About') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithMenu />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          name="Usuario Demo"
          email="demo@exemplo.com"
          onEditAvatar={() => console.log('Edit Avatar')}
        />

        <MenuSection items={menuItems} />

        <TouchableOpacity style={styles.logoutButton}>
          <FontAwesome name="sign-out" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
});
