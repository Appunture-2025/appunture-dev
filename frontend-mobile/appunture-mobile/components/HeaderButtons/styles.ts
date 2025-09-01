import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});

export default styles;
