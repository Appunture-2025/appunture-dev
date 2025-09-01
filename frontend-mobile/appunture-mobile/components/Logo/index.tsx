import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  showText = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer]}>
        <View style={[styles.iconBackground, styles[size]]}>
          <Text style={[styles.iconText, styles[`${size}Text`]]}>A</Text>
        </View>
      </View>
      {showText && (
        <Text style={[styles.logoText, styles[`${size}LogoText`]]}>
          Appunture
        </Text>
      )}
    </View>
  );
};
