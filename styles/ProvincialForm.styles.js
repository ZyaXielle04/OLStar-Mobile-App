// styles/ProvincialForm.styles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4d4d',
    paddingLeft: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  fieldNote: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    marginTop: -4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  pickerButtonPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  autocompleteWrapper: {
    position: 'relative',
    zIndex: 1,
    marginBottom: 8,
    overflow: 'visible',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    marginTop: 4,
    marginBottom: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  suggestionsScrollView: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 10,
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  
  // Trip Type Styles
  tripTypeGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tripTypeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  tripTypeOptionSelected: {
    borderColor: '#ff4d4d',
    backgroundColor: '#ff4d4d',
  },
  tripTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  tripTypeLabelSelected: {
    color: '#fff',
  },
  
  // Destinations Styles
  destinationsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  destinationOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  destinationOptionSelected: {
    borderColor: '#ff4d4d',
    backgroundColor: '#ff4d4d',
  },
  destinationLabel: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  destinationLabelSelected: {
    color: '#fff',
  },
  selectedDestinationsBadge: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedDestinationsText: {
    fontSize: 13,
    color: '#666',
  },
  
  // Vehicle Styles
  vehicleGroup: {
    gap: 12,
    marginBottom: 16,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    gap: 12,
  },
  vehicleCardSelected: {
    borderColor: '#ff4d4d',
    backgroundColor: '#fff0f0',
  },
  vehicleCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  vehicleEmoji: {
    fontSize: 32,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  vehicleNameSelected: {
    color: '#ff4d4d',
  },
  vehicleNameDisabled: {
    color: '#999',
  },
  vehicleCapacity: {
    fontSize: 12,
    color: '#999',
  },
  vehicleCapacityDisabled: {
    color: '#ccc',
  },
  vehiclePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  vehicleWarning: {
    fontSize: 11,
    color: '#ff9800',
    marginLeft: 8,
  },
  
  // Price Preview
  pricePreview: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  pricePreviewTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pricePreviewValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  originalPricePreview: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountedPricePreview: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4caf50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  pricePreviewNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  
  // Buttons
  nextButton: {
    backgroundColor: '#ff4d4d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    padding: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#999',
    fontSize: 16,
  },
  backButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backButtonSmallText: {
    color: '#ff4d4d',
    fontSize: 16,
  },
  
  // Expectations Section
  packageSummaryBox: {
    backgroundColor: '#fff0f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4d4d',
  },
  packageSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4d4d',
    marginBottom: 4,
  },
  packageSummaryDesc: {
    fontSize: 14,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  bulletText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#ff4d4d',
  },
  agreementText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  confirmExpectationsButton: {
    backgroundColor: '#ff4d4d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmExpectationsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Confirm Booking Section
  summaryCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  discountLabel: {
    fontSize: 14,
    color: '#4caf50',
  },
  discountValue: {
    fontSize: 14,
    color: '#4caf50',
  },
  confirmButton: {
    backgroundColor: '#ff4d4d',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Phone Input
  phoneInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#f9f9f9',
    gap: 6,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333',
  },
  phoneNumberInput: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#ff4d4d',
    marginTop: 4,
    marginBottom: 8,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  pickerWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  pickerLabelText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  numberPicker: {
    height: 200,
    width: '100%',
  },
  numberPickerItem: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberPickerItemSelected: {
    backgroundColor: '#ff4d4d',
    borderRadius: 8,
  },
  numberPickerText: {
    fontSize: 18,
    color: '#333',
  },
  numberPickerTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  modalButtonCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modalButtonConfirm: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#ff4d4d',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#666',
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Country Code Picker
  countryCodeSearchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  countryCodeList: {
    maxHeight: 400,
  },
  countryCodeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  countryCodeOptionSelected: {
    backgroundColor: '#fff0f0',
  },
  countryCodeOptionText: {
    fontSize: 16,
    color: '#333',
  },
  countryCodeOptionDialCode: {
    fontSize: 14,
    color: '#666',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  priceNotFoundBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  priceNotFoundBoxText: {
    fontSize: 14,
    color: '#e65100',
    flex: 1,
    lineHeight: 20,
  },
  priceNotFoundText: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '500',
  },
});