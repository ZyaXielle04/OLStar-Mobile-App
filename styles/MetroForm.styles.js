// styles/MetroForm.styles.js
import { StyleSheet, Platform, Dimensions, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;
const isLandscape = width > height;
const isIPhoneX = Platform.OS === 'ios' && height >= 812;

// Helper function for responsive sizing
const getResponsiveSize = (small, medium, tablet) => {
  if (isTablet) return tablet;
  if (isSmallDevice) return small;
  return medium;
};

// Get status bar height safely
const getStatusBarHeightValue = () => {
  if (Platform.OS === 'ios') {
    return isIPhoneX ? 44 : 20;
  }
  return StatusBar.currentHeight || 0;
};

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

const primaryColor = '#FCDAF6';
const primaryColorLight = '#FFF5FD';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: getResponsivePadding(),
    backgroundColor: '#f5f5f5',
    paddingTop: getStatusBarHeightValue(),
    overflow: 'visible',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
    overflow: 'visible',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: getResponsivePadding(),
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'visible',
    position: 'relative',
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#ff4d4d',
    paddingLeft: 10,
  },
  label: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: getResponsiveFontSize(16),
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  errorText: {
    color: '#dc3545',
    fontSize: getResponsiveFontSize(12),
    marginTop: -5,
    marginBottom: 10,
  },
  
  // Autocomplete Styles - FIXED for better overlay
  autocompleteWrapper: {
    position: 'relative',
    zIndex: 9999,
    marginBottom: getResponsiveSize(3, 5, 8),
    overflow: 'visible',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: getResponsiveSize(6, 8, 10),
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    position: 'absolute',
    top: getResponsiveSize(50, 55, 60),
    left: 0,
    right: 0,
    zIndex: 10000,
    elevation: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  suggestionsScrollView: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: getResponsiveSize(10, 12, 15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionText: {
    fontSize: getResponsiveFontSize(12, 14),
    color: '#333',
    marginLeft: getResponsiveSize(6, 8, 10),
    flex: 1,
  },
  
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    height: 50,
  },
  pickerButtonText: {
    fontSize: getResponsiveFontSize(16),
    color: '#333',
  },
  pickerButtonPlaceholder: {
    fontSize: getResponsiveFontSize(16),
    color: '#999',
  },
  durationGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    marginBottom: 10,
  },
  durationOption: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  durationSelected: {
    backgroundColor: '#ff4d4d',
  },
  durationLabel: {
    fontSize: getResponsiveFontSize(14),
    color: '#333',
  },
  durationLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  packageGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },
  packageOption: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  packageOptionSelected: {
    backgroundColor: '#ff4d4d',
    borderColor: '#ff4d4d',
  },
  packageOptionLabel: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  packageOptionLabelSelected: {
    color: '#fff',
  },
  packageOptionDesc: {
    fontSize: getResponsiveFontSize(11),
    color: '#666',
    textAlign: 'center',
  },
  vehicleGroup: {
    gap: 12,
    marginBottom: 15,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 12,
  },
  vehicleCardSelected: {
    backgroundColor: '#fff5f5',
    borderColor: '#ff4d4d',
    borderWidth: 2,
  },
  vehicleCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  vehicleEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  vehicleName: {
    flex: 1,
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#333',
  },
  vehicleNameSelected: {
    color: '#ff4d4d',
  },
  vehicleNameDisabled: {
    color: '#999',
  },
  vehicleCapacity: {
    fontSize: getResponsiveFontSize(12),
    color: '#666',
  },
  vehicleCapacityDisabled: {
    color: '#999',
  },
  vehiclePrice: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  vehicleWarning: {
    fontSize: getResponsiveFontSize(10),
    color: '#ff9800',
    position: 'absolute',
    bottom: -8,
    right: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  pricePreview: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  pricePreviewTitle: {
    fontSize: getResponsiveFontSize(12),
    color: '#666',
    marginBottom: 5,
  },
  pricePreviewValue: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  originalPricePreview: {
    fontSize: getResponsiveFontSize(16),
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountedPricePreview: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  discountBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: getResponsiveFontSize(10),
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  pricePreviewNote: {
    fontSize: getResponsiveFontSize(11),
    color: '#666',
    marginTop: 4,
  },
  nextButton: {
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(16),
  },
  backButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButtonSmallText: {
    color: '#ff4d4d',
    fontSize: getResponsiveFontSize(14),
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  infoBoxTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: getResponsiveFontSize(13),
    color: '#555',
  },
  packageSummaryBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  packageSummaryTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: 5,
  },
  packageSummaryDesc: {
    fontSize: getResponsiveFontSize(13),
    color: '#666',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ff4d4d',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#ff4d4d',
  },
  agreementText: {
    flex: 1,
    fontSize: getResponsiveFontSize(13),
    color: '#555',
    lineHeight: 18,
  },
  confirmExpectationsButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmExpectationsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(16),
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: getResponsivePadding(),
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
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
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#222',
  },
  totalValue: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  discountLabel: {
    fontSize: getResponsiveFontSize(14),
    color: '#4caf50',
  },
  discountValue: {
    fontSize: getResponsiveFontSize(14),
    color: '#4caf50',
  },
  confirmButton: {
    backgroundColor: '#ff4d4d',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(16),
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(16),
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  countryCodeButton: {
    height: 50,
    minWidth: 88,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryCodeText: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#333',
    marginRight: 6,
  },
  phoneNumberInput: {
    flex: 1,
    marginBottom: 0,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: getResponsiveFontSize(16),
    color: '#666',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100000,
    elevation: 100000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: getResponsivePadding(),
    width: isTablet ? '70%' : '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabelText: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  numberPicker: {
    height: 150,
    width: isSmallDevice ? 60 : 80,
  },
  numberPickerItem: {
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  numberPickerItemSelected: {
    backgroundColor: '#ff4d4d20',
    borderRadius: 8,
  },
  numberPickerText: {
    fontSize: getResponsiveFontSize(16),
    color: '#333',
  },
  numberPickerTextSelected: {
    color: '#ff4d4d',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButtonCancel: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#6c757d',
    marginRight: 10,
    alignItems: 'center',
  },
  modalButtonConfirm: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ff4d4d',
    marginLeft: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(14),
  },
  modalButtonTextConfirm: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(14),
  },

  // Country Code Picker Styles
  countryCodeSearchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: getResponsiveFontSize(16),
    backgroundColor: '#fff',
  },
  countryCodeList: {
    maxHeight: 320,
    marginBottom: 15,
  },
  countryCodeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 8,
  },
  countryCodeOptionSelected: {
    backgroundColor: primaryColorLight,
  },
  countryCodeOptionText: {
    flex: 1,
    fontSize: getResponsiveFontSize(14),
    color: '#333',
    marginRight: 12,
  },
  countryCodeOptionDialCode: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: '700',
    color: '#ff4d4d',
  },
});