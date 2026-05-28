// styles/AirportTransferForm.styles.js
import { StyleSheet } from 'react-native';

const primaryColor = '#FCDAF6'; // RGB: 252, 218, 246
const primaryColorLight = '#FFF5FD';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  itinerary: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  sectionTitleDisabled: {
    color: '#999',
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
    color: '#555',
  },
  passengerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  passengerHeaderDisabled: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  arrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  passengerDetails: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  disabledMessage: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#FFEeba',
  },
  disabledMessageText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  infoMessage: {
    backgroundColor: '#D1ECF1',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#BEE1E6',
  },
  infoMessageText: {
    color: '#0C5460',
    fontSize: 14,
    textAlign: 'center',
  },
  radioGroup: {
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  radioSelected: {
    backgroundColor: primaryColorLight,
    borderWidth: 1,
    borderColor: primaryColor,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: primaryColor,
    marginRight: 10,
  },
  radioCircleSelected: {
    backgroundColor: primaryColor,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  airportGroup: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  airportOption: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  airportSelected: {
    backgroundColor: primaryColor,
  },
  airportLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  terminalGroup: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  terminalOption: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  terminalSelected: {
    backgroundColor: primaryColor,
  },
  terminalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  terminalLabelSelected: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  hintText: {
    color: '#999',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: primaryColor,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
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
    fontSize: 16,
  },

  autocompleteWrapper: {
    position: 'relative',
    zIndex: 1,
    marginBottom: 5,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },

  // Picker Button Styles
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    height: 50,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  pickerButtonPlaceholder: {
    fontSize: 16,
    color: '#999',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  pickerScroll: {
    maxHeight: 200,
    width: 60,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    borderRadius: 8,
  },
  pickerItemSelected: {
    backgroundColor: primaryColor,
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  pickerItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButtonCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#6c757d',
    marginRight: 10,
    alignItems: 'center',
  },
  modalButtonConfirm: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: primaryColor,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalButtonTextConfirm: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  picker: {
    width: 100,
    height: 150,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },

  // Area Selection Styles
  areaSection: {
    marginBottom: 20,
  },

  areaGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },

  areaOption: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },

  areaSelected: {
    backgroundColor: '#ff4d4d',
  },

  areaLabel: {
    fontSize: 14,
    color: '#333',
  },

  areaLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },

  // Package Selection Styles
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },

  packageContainer: {
    marginBottom: 20,
  },

  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  packageCardSelected: {
    borderColor: '#ff4d4d',
    backgroundColor: '#fff5f5',
  },

  packageName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },

  packageDetails: {
    marginTop: 10,
  },

  packageDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  packageDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },

  priceContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4d4d',
  },

  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },

  discountedPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4d4d',
    marginRight: 10,
  },

  discountBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },

  packageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stepContainer: {
    padding: 20,
  },

  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },

  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 18,
  },

  progressLine: {
    width: 50,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },

  progressLineActive: {
    backgroundColor: '#ff4d4d',
  },

  nextButton: {
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },

  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  stepButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  submitButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },

  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  priceSummary: {
    backgroundColor: '#fff5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ff4d4d',
  },

  priceSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },

  priceSummaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },

  packageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  numberPicker: {
    height: 150,
    width: 80,
  },
  numberPickerItem: {
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  numberPickerItemSelected: {
    backgroundColor: '#ff4d4d20',
    borderRadius: 8,
  },
  numberPickerText: {
    fontSize: 18,
    color: '#333',
  },
  numberPickerTextSelected: {
    color: '#ff4d4d',
    fontWeight: 'bold',
  },
});