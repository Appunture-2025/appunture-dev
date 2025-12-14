import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

// Test direct PNG import
import LU_PNG from '../static/body-map/LU.png';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 8,
  },
  image: {
    width: 200,
    height: 150,
    backgroundColor: '#ddd',
    borderRadius: 4,
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});

export const PngTestComponent: React.FC = () => {
  console.log('[PngTestComponent] LU_PNG:', typeof LU_PNG, LU_PNG);
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Teste de PNG - LU Layer</Text>
      <Image
        source={LU_PNG}
        style={styles.image}
        resizeMode="contain"
        onLoad={() => console.log('[PngTestComponent] ✅ PNG loaded successfully')}
        onError={(error) => console.error('[PngTestComponent] ❌ PNG failed to load:', error)}
        onLoadStart={() => console.log('[PngTestComponent] 🔄 PNG loading started')}
        onLoadEnd={() => console.log('[PngTestComponent] 🏁 PNG loading ended')}
      />
      <Text style={styles.text}>
        PNG Type: {typeof LU_PNG}
      </Text>
    </View>
  );
};

export default PngTestComponent;