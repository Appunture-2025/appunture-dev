import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { Header } from '../../components';

export default function ProfileScreen() {
  const handleMenuPress = () => {
    console.log('Menu pressionado');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onMenuPress={handleMenuPress} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/100x100.png?text=U' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <FontAwesome name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>Usuario Demo</Text>
          <Text style={styles.userEmail}>demo@exemplo.com</Text>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome name="user" size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Editar Perfil</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome name="bell" size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Notificações</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome name="shield" size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Privacidade</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome name="question-circle" size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Ajuda</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome name="info-circle" size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Sobre</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 16,
    fontWeight: '500',
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
