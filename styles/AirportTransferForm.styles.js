// styles/AirportTransferForm.styles.js
import { StyleSheet, Platform, Dimensions, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;
const isTablet = width >= 768;
const isLandscape = width > height;
const isIPhoneX = Platform.OS === 'ios' && height >= 812;

// Responsive sizing functions
const getResponsiveSize = (small, medium, tablet) => {
  if (isTablet) return tablet;
  if (isSmallDevice) return small;
  return medium;
};

const getResponsivePadding = () => {
  if (isTablet) return 32;
  if (isSmallDevice) return 12;
  return 20;
};

const getResponsiveFontSize = (baseSize) => {
  if (isTablet) return baseSize * 1.2;
  if (isSmallDevice) return baseSize * 0.9;
  return baseSize;
};

const primaryColor = '#FCDAF6';
const primaryColorLight = '#FFF5FD';

// Get status bar height safely
const getStatusBarHeightValue = () => {
  if (Platform.OS === 'ios') {
    return isIPhoneX ? 44 : 20;
  }
  return StatusBar.currentHeight || 0;
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: getResponsivePadding(),
    backgroundColor: '#fff',
    paddingTop: getStatusBarHeightValue(),
    overflow: 'visible',
  },
  itinerary: {
    marginBottom: getResponsiveSize(15, 20, 25),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize(isSmallDevice ? 18 : 20),
    fontWeight: 'bold',
    marginBottom: getResponsiveSize(12, 15, 18),
    color: '#333',
  },
  sectionTitleDisabled: {
    color: '#999',
    opacity: 0.5,
  },
  label: {
    fontSize: getResponsiveFontSize(isSmallDevice ? 14 : 16),
    fontWeight: '600',
    marginBottom: getResponsiveSize(6, 8, 10),
    marginTop: getResponsiveSize(8, 10, 12),
    color: '#555',
  },
  passengerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(12, 15, 18),
    paddingHorizontal: getResponsiveSize(12, 15, 18),
    backgroundColor: '#f5f5f5',
    borderRadius: getResponsiveSize(8, 10, 12),
    marginTop: getResponsiveSize(8, 10, 12),
    marginBottom: getResponsiveSize(8, 10, 12),
  },
  passengerHeaderDisabled: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  arrow: {
    fontSize: getResponsiveFontSize(16, 18),
    fontWeight: 'bold',
    color: '#666',
  },
  passengerDetails: {
    padding: getResponsiveSize(12, 15, 18),
    backgroundColor: '#fff',
    borderRadius: getResponsiveSize(8, 10, 12),
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: getResponsiveSize(8, 10, 12),
  },
  disabledMessage: {
    backgroundColor: '#FFF3CD',
    padding: getResponsiveSize(10, 12, 15),
    borderRadius: getResponsiveSize(6, 8, 10),
    marginVertical: getResponsiveSize(8, 10, 12),
    borderWidth: 1,
    borderColor: '#FFEeba',
  },
  disabledMessageText: {
    color: '#856404',
    fontSize: getResponsiveFontSize(12, 14),
    textAlign: 'center',
  },
  infoMessage: {
    backgroundColor: '#D1ECF1',
    padding: getResponsiveSize(10, 12, 15),
    borderRadius: getResponsiveSize(6, 8, 10),
    marginVertical: getResponsiveSize(8, 10, 12),
    borderWidth: 1,
    borderColor: '#BEE1E6',
  },
  infoMessageText: {
    color: '#0C5460',
    fontSize: getResponsiveFontSize(12, 14),
    textAlign: 'center',
  },
  radioGroup: {
    marginBottom: getResponsiveSize(15, 20, 25),
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(8, 10, 12),
    paddingHorizontal: getResponsiveSize(12, 15, 18),
    backgroundColor: '#f5f5f5',
    borderRadius: getResponsiveSize(6, 8, 10),
    marginBottom: getResponsiveSize(8, 10, 12),
  },
  radioSelected: {
    backgroundColor: primaryColorLight,
    borderWidth: 1,
    borderColor: primaryColor,
  },
  radioCircle: {
    width: getResponsiveSize(18, 20, 24),
    height: getResponsiveSize(18, 20, 24),
    borderRadius: getResponsiveSize(9, 10, 12),
    borderWidth: 2,
    borderColor: primaryColor,
    marginRight: getResponsiveSize(8, 10, 12),
  },
  radioCircleSelected: {
    backgroundColor: primaryColor,
  },
  radioLabel: {
    fontSize: getResponsiveFontSize(14, 16),
    color: '#333',
  },
  airportGroup: {
    flexDirection: isLandscape ? 'row' : 'column',
    marginBottom: getResponsiveSize(12, 15, 18),
    gap: getResponsiveSize(8, 10, 12),
  },
  airportOption: {
    flex: 1,
    padding: getResponsiveSize(10, 12, 15),
    backgroundColor: '#f5f5f5',
    borderRadius: getResponsiveSize(6, 8, 10),
    alignItems: 'center',
    marginRight: isLandscape ? getResponsiveSize(8, 10, 12) : 0,
  },
  airportSelected: {
    backgroundColor: primaryColor,
  },
  airportLabel: {
    fontSize: getResponsiveFontSize(14, 16),
    fontWeight: '600',
    color: '#333',
  },
  terminalGroup: {
    flexDirection: isLandscape ? 'row' : 'column',
    marginBottom: getResponsiveSize(12, 15, 18),
    gap: getResponsiveSize(8, 10, 12),
  },
  terminalOption: {
    flex: 1,
    padding: getResponsiveSize(10, 12, 15),
    backgroundColor: '#f5f5f5',
    borderRadius: getResponsiveSize(6, 8, 10),
    alignItems: 'center',
    marginRight: isLandscape ? getResponsiveSize(8, 10, 12) : 0,
  },
  terminalSelected: {
    backgroundColor: primaryColor,
  },
  terminalLabel: {
    fontSize: getResponsiveFontSize(12, 14),
    fontWeight: '600',
    color: '#333',
  },
  terminalLabelSelected: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: getResponsiveSize(10, 12, 15),
    marginBottom: getResponsiveSize(12, 15, 18),
    borderRadius: getResponsiveSize(6, 8, 10),
    fontSize: getResponsiveFontSize(14, 16),
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSize(12, 15, 18),
    gap: getResponsiveSize(8, 10, 12),
  },
  countryCodeButton: {
    height: getResponsiveSize(45, 50, 55),
    minWidth: isSmallDevice ? 70 : 88,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: getResponsiveSize(6, 8, 10),
    paddingHorizontal: getResponsiveSize(8, 12, 15),
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryCodeText: {
    fontSize: getResponsiveFontSize(14, 16),
    fontWeight: '600',
    color: '#333',
    marginRight: getResponsiveSize(4, 6, 8),
  },
  phoneNumberInput: {
    flex: 1,
    marginBottom: 0,
  },
  textArea: {
    height: getResponsiveSize(70, 80, 100),
    textAlignVertical: 'top',
  },
  readOnlyField: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: getResponsiveSize(10, 12, 15),
    marginBottom: getResponsiveSize(12, 15, 18),
    borderRadius: getResponsiveSize(6, 8, 10),
    backgroundColor: '#f9f9f9',
  },
  readOnlyText: {
    fontSize: getResponsiveFontSize(14, 16),
    color: '#666',
  },
  errorText: {
    color: '#dc3545',
    fontSize: getResponsiveFontSize(10, 12),
    marginTop: -8,
    marginBottom: getResponsiveSize(8, 10, 12),
  },
  hintText: {
    color: '#999',
    fontSize: getResponsiveFontSize(10, 12),
    marginTop: -8,
    marginBottom: getResponsiveSize(8, 10, 12),
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: primaryColor,
    padding: getResponsiveSize(12, 15, 18),
    borderRadius: getResponsiveSize(6, 8, 10),
    alignItems: 'center',
    marginTop: getResponsiveSize(8, 10, 12),
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(14, 16),
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: getResponsiveSize(12, 15, 18),
    borderRadius: getResponsiveSize(6, 8, 10),
    alignItems: 'center',
    marginTop: getResponsiveSize(8, 10, 12),
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(14, 16),
  },
  autocompleteWrapper: {
    position: 'relative',
    zIndex: 999,
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
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    overflow: 'scroll',
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
    padding: getResponsiveSize(10, 12, 15),
    marginBottom: getResponsiveSize(12, 15, 18),
    borderRadius: getResponsiveSize(6, 8, 10),
    backgroundColor: '#fff',
    justifyContent: 'center',
    height: getResponsiveSize(45, 50, 55),
  },
  pickerButtonText: {
    fontSize: getResponsiveFontSize(14, 16),
    color: '#333',
  },
  pickerButtonPlaceholder: {
    fontSize: getResponsiveFontSize(14, 16),
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: getResponsiveSize(10, 12, 16),
    padding: getResponsiveSize(15, 20, 25),
    width: isTablet ? '70%' : '90%',
    maxHeight: isLandscape ? '90%' : '80%',
  },
  modalTitle: {
    fontSize: getResponsiveFontSize(18, 20, 24),
    fontWeight: 'bold',
    marginBottom: getResponsiveSize(15, 20, 25),
    textAlign: 'center',
    color: '#333',
  },
  pickerRow: {
    flexDirection: isLandscape ? 'row' : 'column',
    justifyContent: 'space-between',
    marginBottom: getResponsiveSize(15, 20, 25),
    gap: getResponsiveSize(15, 20, 25),
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: getResponsiveFontSize(12, 14),
    fontWeight: '600',
    marginBottom: getResponsiveSize(8, 10, 12),
    color: '#555',
  },
  pickerScroll: {
    maxHeight: 200,
    width: isSmallDevice ? 50 : 60,
  },
  pickerItem: {
    paddingVertical: getResponsiveSize(8, 10, 12),
    paddingHorizontal: getResponsiveSize(3, 5, 8),
    alignItems: 'center',
    borderRadius: getResponsiveSize(6, 8, 10),
  },
  pickerItemSelected: {
    backgroundColor: primaryColor,
  },
  pickerItemText: {
    fontSize: getResponsiveFontSize(14, 16),
    color: '#333',
  },
  pickerItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: getResponsiveSize(15, 20, 25),
    gap: getResponsiveSize(10, 15, 20),
  },
  modalButtonCancel: {
    flex: 1,
    padding: getResponsiveSize(10, 12, 15),
    borderRadius: getResponsiveSize(6, 8, 10),
    backgroundColor: '#6c757d',
    alignItems: 'center',
  },
  modalButtonConfirm: {
    flex: 1,
    padding: getResponsiveSize(10, 12, 15),
    borderRadius: getResponsiveSize(6, 8, 10),
    backgroundColor: primaryColor,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(14, 16),
  },
  modalButtonTextConfirm: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(14, 16),
  },
  countryCodeList: {
    maxHeight: 320,
    marginBottom: getResponsiveSize(12, 15, 18),
  },
  countryCodeSearchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: getResponsiveSize(10, 12, 15),
    marginBottom: getResponsiveSize(10, 12, 15),
    borderRadius: getResponsiveSize(6, 8, 10),
    fontSize: getResponsiveFontSize(14, 16),
    backgroundColor: '#fff',
  },
  countryCodeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(11, 13, 15),
    paddingHorizontal: getResponsiveSize(10, 12, 15),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: getResponsiveSize(6, 8, 10),
  },
  countryCodeOptionSelected: {
    backgroundColor: primaryColorLight,
  },
  countryCodeOptionText: {
    flex: 1,
    fontSize: getResponsiveFontSize(13, 15),
    color: '#333',
    marginRight: getResponsiveSize(10, 12, 15),
  },
  countryCodeOptionDialCode: {
    fontSize: getResponsiveFontSize(13, 15),
    fontWeight: '700',
    color: '#ff4d4d',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getResponsiveSize(15, 20, 25),
    gap: getResponsiveSize(15, 20, 25),
  },
  pickerWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabelText: {
    fontSize: getResponsiveFontSize(14, 16),
    fontWeight: 'bold',
    marginBottom: getResponsiveSize(8, 10, 12),
    color: '#555',
  },
  picker: {
    width: isSmallDevice ? 80 : 100,
    height: 150,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSize(30, 40, 60),
  },
  loadingText: {
    marginTop: getResponsiveSize(8, 10, 12),
    fontSize: getResponsiveFontSize(14, 16),
    color: '#666',
  },
  areaSection: {
    marginBottom: getResponsiveSize(15, 20, 25),
  },
  areaGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: getResponsiveSize(8, 10, 12),
    gap: getResponsiveSize(8, 10, 12),
  },
  areaOption: {
    paddingHorizontal: getResponsiveSize(12, 15, 20),
    paddingVertical: getResponsiveSize(8, 10, 12),
    borderRadius: getResponsiveSize(6, 8, 10),
    backgroundColor: '#f0f0f0',
  },
  areaSelected: {
    backgroundColor: '#ff4d4d',
  },
  areaLabel: {
    fontSize: getResponsiveFontSize(12, 14),
    color: '#333',
  },
  areaLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(10, 12, 15),
  },
  packageContainer: {
    marginBottom: getResponsiveSize(15, 20, 25),
  },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: getResponsiveSize(10, 12, 16),
    padding: getResponsiveSize(12, 15, 20),
    marginBottom: getResponsiveSize(10, 12, 15),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  packageCardSelected: {
    borderColor: '#ff4d4d',
    backgroundColor: '#fff5f5',
  },
  packageName: {
    fontSize: getResponsiveFontSize(16, 18, 20),
    fontWeight: '700',
    color: '#222',
  },
  packageDetails: {
    marginTop: getResponsiveSize(8, 10, 12),
  },
  packageDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSize(4, 6, 8),
  },
  packageDetailText: {
    marginLeft: getResponsiveSize(6, 8, 10),
    fontSize: getResponsiveFontSize(12, 14),
    color: '#666',
  },
  priceContainer: {
    marginTop: getResponsiveSize(10, 12, 15),
    paddingTop: getResponsiveSize(10, 12, 15),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: getResponsiveSize(5, 8, 10),
  },
  price: {
    fontSize: getResponsiveFontSize(18, 20, 24),
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  originalPrice: {
    fontSize: getResponsiveFontSize(14, 16),
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: getResponsiveFontSize(18, 20, 24),
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  discountBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: getResponsiveSize(6, 8, 10),
    paddingVertical: getResponsiveSize(3, 4, 6),
    borderRadius: 4,
    fontSize: getResponsiveFontSize(10, 12),
    color: '#fff',
    fontWeight: '600',
  },
  packageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSize(8, 10, 12),
  },
  stepContainer: {
    padding: getResponsiveSize(15, 20, 25),
  },
  stepTitle: {
    fontSize: getResponsiveFontSize(18, 20, 24),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: getResponsiveSize(15, 20, 25),
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: getResponsiveSize(15, 20, 25),
    backgroundColor: '#fff',
    flexWrap: 'wrap',
  },
  progressStep: {
    width: getResponsiveSize(35, 40, 50),
    height: getResponsiveSize(35, 40, 50),
    borderRadius: getResponsiveSize(17.5, 20, 25),
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: '#ff4d4d',
  },
  progressStepText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(16, 18, 20),
  },
  progressLine: {
    width: isSmallDevice ? 30 : 50,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: getResponsiveSize(3, 5, 8),
  },
  progressLineActive: {
    backgroundColor: '#ff4d4d',
  },
  nextButton: {
    backgroundColor: '#ff4d4d',
    padding: getResponsiveSize(12, 15, 18),
    borderRadius: getResponsiveSize(10, 12, 16),
    alignItems: 'center',
    marginTop: getResponsiveSize(15, 20, 25),
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(14, 16),
  },
  stepButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: getResponsiveSize(15, 20, 25),
    gap: getResponsiveSize(10, 15, 20),
  },
  submitButton: {
    backgroundColor: '#4caf50',
    padding: getResponsiveSize(12, 15, 18),
    borderRadius: getResponsiveSize(10, 12, 16),
    alignItems: 'center',
    flex: 1,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(14, 16),
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  priceSummary: {
    backgroundColor: '#fff5f5',
    padding: getResponsiveSize(12, 15, 20),
    borderRadius: getResponsiveSize(10, 12, 16),
    marginBottom: getResponsiveSize(15, 20, 25),
    borderWidth: 1,
    borderColor: '#ff4d4d',
  },
  priceSummaryTitle: {
    fontSize: getResponsiveFontSize(14, 16, 18),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: getResponsiveSize(8, 10, 12),
  },
  priceSummaryText: {
    fontSize: getResponsiveFontSize(12, 14),
    color: '#666',
    marginBottom: getResponsiveSize(3, 5, 8),
  },
  numberPicker: {
    height: 150,
    width: isSmallDevice ? 60 : 80,
  },
  numberPickerItem: {
    padding: getResponsiveSize(8, 10, 12),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  numberPickerItemSelected: {
    backgroundColor: '#ff4d4d20',
    borderRadius: getResponsiveSize(6, 8, 10),
  },
  numberPickerText: {
    fontSize: getResponsiveFontSize(16, 18),
    color: '#333',
  },
  numberPickerTextSelected: {
    color: '#ff4d4d',
    fontWeight: 'bold',
  },
});