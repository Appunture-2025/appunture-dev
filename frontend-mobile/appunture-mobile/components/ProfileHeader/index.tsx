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
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: avatarUri || 'https://via.placeholder.com/100x100.png?text=U' }}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.editButton} onPress={onEditAvatar}>
          <FontAwesome name="camera" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{email}</Text>
    </View>
  );
};
