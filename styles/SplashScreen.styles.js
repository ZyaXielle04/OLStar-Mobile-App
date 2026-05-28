import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 18,
    color: '#fcdaf6',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },

  description: {
    fontSize: 14,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
    paddingHorizontal: 10,
  },

  button: {
    paddingVertical: 14,
    paddingHorizontal: 45,
    borderRadius: 14,
    elevation: 5,
  },

  buttonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
});