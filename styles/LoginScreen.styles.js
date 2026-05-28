import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },

  subtitle: {
    color: '#dae9ff',
    fontSize: 14,
    marginBottom: 25,
    textAlign: 'center',
  },

  input: {
    backgroundColor: 'rgba(252, 218, 246, 1)',
    color: 'rgba(30, 41, 59, 1)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },

  button: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 5,
  },

  buttonText: {
    color: 'rgba(252, 218, 246, 1)',
    fontSize: 18,
    fontWeight: '700',
  },

  or: {
    color: '#94a3b8',
    textAlign: 'center',
    marginVertical: 15,
    fontWeight: '600',
  },

  socialButton: {
    backgroundColor: 'rgba(252, 218, 246, 1)',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  socialText: {
    color: 'rgba(30, 41, 59, 1)',
    fontSize: 14,
    fontWeight: '600',
  },

  googleIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },

  footer: {
    
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 20,
  },

  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 5,
  },

  signupText: {
    color: 'rgba(30, 41, 59, 1)',
    fontWeight: '700',
    marginTop: 20,
  },
});