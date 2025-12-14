import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { getPngForLayer } from '../utils/svgAssets';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 10,
    position: 'relative',
  },
  pngContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,0,0,0.1)', // Red background to debug
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  marker: {
    position: 'absolute',
    top: 50,
    left: 50,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'blue',
    zIndex: 10,
  },
  debugText: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: 5,
    borderRadius: 3,
    zIndex: 20,
  },
});

interface BodyMapDebugProps {
  layerId: string;
}

export const BodyMapDebug: React.FC<BodyMapDebugProps> = ({ layerId }) => {
  const pngSource = getPngForLayer(layerId);
  
  console.log(`[BodyMapDebug] Layer ${layerId} - PNG:`, typeof pngSource, !!pngSource);
  
  return (
    <View style={styles.container}>
      <Text style={styles.debugText}>
        Debug: {layerId} - PNG: {!!pngSource ? 'YES' : 'NO'}
      </Text>
      
      {/* PNG Layer */}
      <View style={styles.pngContainer}>
        {pngSource ? (
          <Image
            source={pngSource}
            style={styles.image}
            resizeMode="contain"
            onLoad={() => console.log(`[BodyMapDebug] ✅ PNG loaded for ${layerId}`)}
            onError={(error) => console.error(`[BodyMapDebug] ❌ PNG error for ${layerId}:`, error)}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>No PNG for {layerId}</Text>
          </View>
        )}
      </View>
      
      {/* Test Marker */}
      <View style={styles.marker} />
    </View>
  );
};

export default BodyMapDebug;