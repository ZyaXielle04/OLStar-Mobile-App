import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // ================= CONTAINER =================
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },

  // ================= HEADER =================
  title: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 22,
  },

  // ================= INPUT =================
  input: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },

  inputWithIcon: {
    paddingRight: 45, // prevents overlap with eye icon
  },

  // ================= PRIMARY BUTTON =================
  button: {
    backgroundColor: '#fcdaf6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,

    shadowColor: '#fcdaf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ================= DIVIDER =================
  or: {
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 22,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1,
  },

  // ================= SOCIAL BUTTONS =================
  socialButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },

  socialButtonActive: {
    borderColor: '#fcdaf6',
    transform: [{ scale: 0.99 }],
  },

  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  socialText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },

  googleIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },

  // ================= OTP SECTION =================
  otpContainer: {
    marginTop: 6,
  },

  otpInput: {
    letterSpacing: 6,
    textAlign: 'center',
    fontWeight: '700',
  },

  // ================= FOOTER =================
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 6,
    flexWrap: 'wrap',
  },

  footer: {
    color: '#94a3b8',
    fontSize: 14,
  },

  loginText: {
    color: '#fcdaf6',
    fontWeight: '800',
    fontSize: 14,
  },

  // ================= STATUS TEXT =================
  successText: {
    color: '#22C55E',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },

  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },

  footer: {
    color: '#94a3b8',
    textAlign: 'center',
  },

  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    gap: 5,
  },

  signupText: {
    color: '#fcdaf6',
    fontWeight: '700',
  },
});