import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from './styles';

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatarUri?: string;
  onEditAvatar?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  email,
  avatarUri,
  onEditAvatar,
}) => {
  return (
    <View style={styles.container} accessibilityRole="header">
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: avatarUri || 'https://via.placeholder.com/100x100.png?text=U' }}
          style={styles.avatar}
          accessibilityLabel={`Foto de perfil de ${name}`}
          accessibilityRole="image"
        />
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={onEditAvatar}
          accessibilityLabel="Alterar foto de perfil"
          accessibilityHint="Toque duas vezes para alterar sua foto de perfil"
          accessibilityRole="button"
        >
          <FontAwesome name="camera" size={16} color="#FFFFFF" accessibilityElementsHidden />
        </TouchableOpacity>
      </View>
      <Text style={styles.name} accessibilityRole="text">{name}</Text>
      <Text style={styles.email} accessibilityRole="text">{email}</Text>
    </View>
  );
};
