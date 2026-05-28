import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // ================= MODAL =================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.70)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  modalContainer: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 30,
    paddingVertical: 34,
    paddingHorizontal: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 12,
  },

  modalTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  modalText: {
    color: '#cbd5e1',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 22,
    paddingHorizontal: 6,
  },

  modalButton: {
    backgroundColor: '#fcdaf6',
    paddingVertical: 14,
    paddingHorizontal: 42,
    borderRadius: 18,

    shadowColor: '#fcdaf6',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  modalButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  countdownText: {
    color: '#fcdaf6',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.3,
  },
})