import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C3E50',
    marginTop: 10,
  },

  message: {
    fontSize: 14,
    color: '#00000080',
    textAlign: 'center',
    marginTop: 10,
  },

  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
  },

  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },

  confirmButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FF4D6D',
    borderRadius: 10,
    alignItems: 'center',
  },

  cancelText: {
    color: '#333',
    fontWeight: '600',
  },

  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
});