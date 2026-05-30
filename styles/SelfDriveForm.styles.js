// styles/SelfDriveForm.styles.js
import { StyleSheet, Platform, Dimensions, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;
const isIPhoneX = Platform.OS === 'ios' && height >= 812;

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
  sectionSubtitle: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
    marginBottom: 15,
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
  autocompleteWrapper: {
    position: 'relative',
    zIndex: 9999,
    marginBottom: 5,
    overflow: 'visible',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    position: 'absolute',
    top: 50,
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
    padding: 12,
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
    fontSize: getResponsiveFontSize(14),
    color: '#333',
    marginLeft: 8,
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
  searchButton: {
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(16),
  },
  backToItinerary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backToItineraryText: {
    color: '#ff4d4d',
    fontSize: getResponsiveFontSize(14),
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: getResponsiveFontSize(14),
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  unitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
    zIndex: 1,
  },
  unitCardSelected: {
    borderColor: '#ff4d4d',
    backgroundColor: '#fff5f5',
  },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitIcon: {
    width: 60,
    alignItems: 'center',
  },
  unitInfo: {
    flex: 1,
  },
  unitName: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '700',
    color: '#222',
  },
  unitType: {
    fontSize: getResponsiveFontSize(12),
    color: '#666',
    marginTop: 2,
  },
  unitColor: {
    fontSize: getResponsiveFontSize(12),
    color: '#666',
    marginTop: 2,
  },
  unitPrice: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  originalPrice: {
    fontSize: getResponsiveFontSize(14),
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  perDay: {
    fontSize: getResponsiveFontSize(10),
    color: '#999',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  selectedBadgeText: {
    fontSize: getResponsiveFontSize(12),
    color: '#4caf50',
    marginLeft: 5,
    fontWeight: '600',
  },
  floatingButtonContainer: {
    position: 'relative',
    marginTop: 20,
    marginBottom: 10,
  },
  pickUnitButton: {
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  pickUnitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(16),
  },
  pickUnitPrice: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(18),
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
  readOnlyField: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  readOnlyText: {
    fontSize: getResponsiveFontSize(16),
    color: '#666',
  },
});

// Helper function for responsive sizing
function getResponsiveSize(small, medium, tablet) {
  if (isTablet) return tablet;
  if (isSmallDevice) return small;
  return medium;
}