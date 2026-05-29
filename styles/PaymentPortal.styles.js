// styles/PaymentPortal.styles.js
import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

const getResponsivePadding = () => {
  if (isTablet) return 24;
  if (isSmallDevice) return 15;
  return 20;
};

const getResponsiveFontSize = (baseSize) => {
  if (isTablet) return baseSize * 1.2;
  if (isSmallDevice) return baseSize * 0.9;
  return baseSize;
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: getResponsivePadding(),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: 'bold',
    color: '#222',
    marginTop: 10,
  },
  subtitle: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
    marginTop: 5,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: getResponsivePadding(),
    padding: getResponsivePadding(),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
  },
  summaryValue: {
    fontSize: getResponsiveFontSize(14),
    color: '#222',
    fontWeight: '500',
  },
  summaryTotal: {
    borderBottomWidth: 0,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryTotalLabel: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#222',
  },
  summaryTotalValue: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  paymentMethodTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#222',
    marginHorizontal: getResponsivePadding(),
    marginBottom: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: getResponsivePadding(),
    marginBottom: 10,
    padding: getResponsivePadding(),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  paymentMethodCardSelected: {
    borderColor: '#4caf50',
    backgroundColor: '#f0fff4',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#4caf50',
  },
  radioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4caf50',
  },
  paymentMethodName: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#222',
  },
  paymentMethodDescription: {
    fontSize: getResponsiveFontSize(12),
    color: '#666',
    marginTop: 2,
  },
  cardIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  cardIconText: {
    fontSize: getResponsiveFontSize(12),
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  paymentForm: {
    backgroundColor: '#fff',
    margin: getResponsivePadding(),
    padding: getResponsivePadding(),
    borderRadius: 12,
  },
  formLabel: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 12,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: getResponsiveFontSize(16),
    backgroundColor: '#fff',
  },
  formInputError: {
    borderColor: '#ff4d4d',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: getResponsiveFontSize(12),
    marginTop: 4,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardExpiry: {
    flex: 1,
    marginRight: 10,
  },
  cardCVV: {
    flex: 1,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f9f0',
    borderRadius: 8,
  },
  securityText: {
    fontSize: getResponsiveFontSize(12),
    color: '#4caf50',
    marginLeft: 8,
  },
  gcashHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gcashTitle: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: 'bold',
    color: '#007aff',
    marginTop: 10,
  },
  gcashSubtitle: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
    marginTop: 5,
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 20,
  },
  qrCodeText: {
    fontSize: getResponsiveFontSize(14),
    color: '#999',
    marginTop: 10,
  },
  qrCodeSubtext: {
    fontSize: getResponsiveFontSize(12),
    color: '#bbb',
    marginTop: 5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: getResponsiveFontSize(12),
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: getResponsiveFontSize(12),
    color: '#0066cc',
    marginLeft: 10,
  },
  bankOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  bankOptionSelected: {
    borderColor: '#4caf50',
    backgroundColor: '#f0fff4',
  },
  bankOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankLogo: {
    fontSize: 32,
    marginRight: 12,
  },
  bankName: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#222',
  },
  bankAccount: {
    fontSize: getResponsiveFontSize(12),
    color: '#666',
    marginTop: 2,
  },
  bankInstructions: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
  },
  instructionsTitle: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: '600',
    color: '#222',
    marginBottom: 10,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4caf50',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    marginRight: 10,
  },
  stepText: {
    flex: 1,
    fontSize: getResponsiveFontSize(13),
    color: '#666',
  },
  buttonContainer: {
    padding: getResponsivePadding(),
    paddingBottom: getResponsivePadding() * 2,
  },
  payButton: {
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(16),
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(16),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: 'bold',
    color: '#222',
    marginTop: 20,
  },
  errorMessage: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: width * 0.85,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 20,
  },
  errorIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  bookingIdContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  bookingIdLabel: {
    fontSize: getResponsiveFontSize(12),
    color: '#666',
  },
  bookingIdValue: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#ff4d4d',
    marginTop: 4,
  },
  countdownText: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(16),
  },
});