import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  iconBackground: {
    backgroundColor: '#007AFF',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  logoText: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  // Size variants
  small: {
    width: 40,
    height: 40,
  },
  medium: {
    width: 60,
    height: 60,
  },
  large: {
    width: 80,
    height: 80,
  },
  smallText: {
    fontSize: 20,
  },
  mediumText: {
    fontSize: 28,
  },
  largeText: {
    fontSize: 36,
  },
  smallLogoText: {
    fontSize: 16,
  },
  mediumLogoText: {
    fontSize: 20,
  },
  largeLogoText: {
    fontSize: 24,
  },
});

export default styles;
