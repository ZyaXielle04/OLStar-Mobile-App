// components/booking/PaymentPortal.js
import { View, Text, TextInput, Pressable, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { styles } from '../../styles/PaymentPortal.styles';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentPortal({ bookingData, onBack, onPaymentComplete }) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  
  // Card Payment States
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [cardErrors, setCardErrors] = useState({});
  
  // GCash Payment States
  const [gcashNumber, setGcashNumber] = useState('');
  const [gcashError, setGcashError] = useState('');
  
  // Bank Transfer States
  const [selectedBank, setSelectedBank] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  
  const [showBankModal, setShowBankModal] = useState(false);
  
  // Countdown timer for payment confirmation
  const [countdown, setCountdown] = useState(0);
  
  const banks = [
    { id: 'bpi', name: 'BPI', logo: '🏦', accountNumber: '1234-5678-9012' },
    { id: 'bdo', name: 'BDO', logo: '🏦', accountNumber: '2345-6789-0123' },
    { id: 'metrobank', name: 'Metrobank', logo: '🏦', accountNumber: '3456-7890-1234' },
    { id: 'security_bank', name: 'Security Bank', logo: '🏦', accountNumber: '4567-8901-2345' },
    { id: 'unionbank', name: 'UnionBank', logo: '🏦', accountNumber: '5678-9012-3456' }
  ];
  
  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Credit / Debit Card',
      icon: 'card-outline',
      description: 'Visa, Mastercard, JCB, Amex'
    },
    {
      id: 'gcash',
      name: 'GCash',
      icon: 'phone-portrait-outline',
      description: 'Pay using GCash'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: 'business-outline',
      description: 'Bank transfer via BPI, BDO, Metrobank'
    }
  ];
  
  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substring(0, 19);
  };
  
  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };
  
  const validateCardDetails = () => {
    const errors = {};
    
    // Card Number
    const cardNumberClean = cardDetails.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean) {
      errors.cardNumber = 'Card number is required';
    } else if (cardNumberClean.length !== 16) {
      errors.cardNumber = 'Invalid card number';
    } else if (!/^[0-9]{16}$/.test(cardNumberClean)) {
      errors.cardNumber = 'Card number must contain only numbers';
    }
    
    // Cardholder Name
    if (!cardDetails.cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    } else if (cardDetails.cardholderName.trim().length < 3) {
      errors.cardholderName = 'Enter full name as shown on card';
    }
    
    // Expiry Date
    if (!cardDetails.expiryMonth || !cardDetails.expiryYear) {
      errors.expiry = 'Expiry date is required';
    } else {
      const month = parseInt(cardDetails.expiryMonth);
      const year = parseInt(`20${cardDetails.expiryYear}`);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      if (month < 1 || month > 12) {
        errors.expiry = 'Invalid expiry month';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiry = 'Card has expired';
      }
    }
    
    // CVV
    if (!cardDetails.cvv) {
      errors.cvv = 'CVV is required';
    } else if (!/^[0-9]{3,4}$/.test(cardDetails.cvv)) {
      errors.cvv = 'Invalid CVV';
    }
    
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateGCash = () => {
    if (!gcashNumber) {
      setGcashError('GCash number is required');
      return false;
    }
    
    const cleaned = gcashNumber.replace(/\D/g, '');
    if (cleaned.length !== 11 && cleaned.length !== 10) {
      setGcashError('Invalid GCash number (must be 10-11 digits)');
      return false;
    }
    
    setGcashError('');
    return true;
  };
  
  const validateBankTransfer = () => {
    if (!selectedBank) {
      Alert.alert('Error', 'Please select a bank');
      return false;
    }
    
    if (!referenceNumber.trim()) {
      Alert.alert('Error', 'Please enter the reference number');
      return false;
    }
    
    return true;
  };
  
  const handlePayment = async () => {
    let isValid = false;
    
    switch (selectedPaymentMethod) {
      case 'credit_card':
        isValid = validateCardDetails();
        break;
      case 'gcash':
        isValid = validateGCash();
        break;
      case 'bank_transfer':
        isValid = validateBankTransfer();
        break;
      default:
        Alert.alert('Error', 'Please select a payment method');
        return;
    }
    
    if (!isValid) return;
    
    // Process payment
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStatus('success');
      setShowPaymentModal(true);
      
      // Start countdown for auto-redirect
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Save to AsyncStorage or backend here
      saveBookingToHistory();
    }, 2000);
  };
  
  const saveBookingToHistory = () => {
    // This is where you would save to Firebase or AsyncStorage
    const completedBooking = {
      ...bookingData,
      paymentMethod: selectedPaymentMethod,
      paymentStatus: 'completed',
      paymentDate: new Date().toISOString(),
      bookingId: `BOOK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };
    
    console.log('Saving booking:', completedBooking);
    
    // Save to AsyncStorage or Firebase here
    // For now, just return the data
    return completedBooking;
  };
  
  const handleCloseModal = () => {
    setShowPaymentModal(false);
    if (paymentStatus === 'success') {
      const completedBooking = {
        ...bookingData,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'completed',
        paymentDate: new Date().toISOString(),
        bookingId: `BOOK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      };
      onPaymentComplete(completedBooking);
    }
  };
  
  const renderBookingSummary = () => {
    if (!bookingData) return null;
    
    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service:</Text>
          <Text style={styles.summaryValue}>Airport Transfer</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Package:</Text>
          <Text style={styles.summaryValue}>{bookingData.selectedPackage?.name}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date:</Text>
          <Text style={styles.summaryValue}>{bookingData.date}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Time:</Text>
          <Text style={styles.summaryValue}>{bookingData.time}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Passengers:</Text>
          <Text style={styles.summaryValue}>{bookingData.passengerDetails?.numPassengers}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.summaryTotalLabel}>Total Amount:</Text>
          <Text style={styles.summaryTotalValue}>
            {formatPrice(bookingData.price?.final)}
          </Text>
        </View>
      </View>
    );
  };
  
  const renderCreditCardForm = () => {
    return (
      <View style={styles.paymentForm}>
        <Text style={styles.formLabel}>Card Number</Text>
        <TextInput
          style={[styles.formInput, cardErrors.cardNumber && styles.formInputError]}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={cardDetails.cardNumber}
          onChangeText={(text) => setCardDetails({...cardDetails, cardNumber: formatCardNumber(text)})}
          maxLength={19}
        />
        {cardErrors.cardNumber && <Text style={styles.errorText}>{cardErrors.cardNumber}</Text>}
        
        <Text style={styles.formLabel}>Cardholder Name</Text>
        <TextInput
          style={[styles.formInput, cardErrors.cardholderName && styles.formInputError]}
          placeholder="AS IT APPEARS ON CARD"
          placeholderTextColor="#999"
          autoCapitalize="characters"
          value={cardDetails.cardholderName}
          onChangeText={(text) => setCardDetails({...cardDetails, cardholderName: text.toUpperCase()})}
        />
        {cardErrors.cardholderName && <Text style={styles.errorText}>{cardErrors.cardholderName}</Text>}
        
        <View style={styles.cardRow}>
          <View style={styles.cardExpiry}>
            <Text style={styles.formLabel}>Expiry Date</Text>
            <TextInput
              style={[styles.formInput, cardErrors.expiry && styles.formInputError]}
              placeholder="MM/YY"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={cardDetails.expiryMonth && cardDetails.expiryYear ? `${cardDetails.expiryMonth}/${cardDetails.expiryYear}` : ''}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, '');
                if (cleaned.length >= 2) {
                  setCardDetails({
                    ...cardDetails,
                    expiryMonth: cleaned.substring(0, 2),
                    expiryYear: cleaned.substring(2, 4)
                  });
                } else {
                  setCardDetails({
                    ...cardDetails,
                    expiryMonth: cleaned,
                    expiryYear: ''
                  });
                }
              }}
              maxLength={5}
            />
            {cardErrors.expiry && <Text style={styles.errorText}>{cardErrors.expiry}</Text>}
          </View>
          
          <View style={styles.cardCVV}>
            <Text style={styles.formLabel}>CVV</Text>
            <TextInput
              style={[styles.formInput, cardErrors.cvv && styles.formInputError]}
              placeholder="123"
              placeholderTextColor="#999"
              keyboardType="numeric"
              secureTextEntry
              value={cardDetails.cvv}
              onChangeText={(text) => setCardDetails({...cardDetails, cvv: text.replace(/\D/g, '').substring(0, 4)})}
              maxLength={4}
            />
            {cardErrors.cvv && <Text style={styles.errorText}>{cardErrors.cvv}</Text>}
          </View>
        </View>
        
        <View style={styles.securityBadge}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#4caf50" />
          <Text style={styles.securityText}>Your payment is secure and encrypted</Text>
        </View>
      </View>
    );
  };
  
  const renderGCashForm = () => {
    return (
      <View style={styles.paymentForm}>
        <View style={styles.gcashHeader}>
          <Ionicons name="phone-portrait-outline" size={48} color="#007aff" />
          <Text style={styles.gcashTitle}>Pay with GCash</Text>
          <Text style={styles.gcashSubtitle}>Scan QR code or enter your GCash number</Text>
        </View>
        
        <View style={styles.qrCodePlaceholder}>
          <Ionicons name="qr-code-outline" size={120} color="#ccc" />
          <Text style={styles.qrCodeText}>GCash QR Code will appear here</Text>
          <Text style={styles.qrCodeSubtext}>Scan with GCash app to pay</Text>
        </View>
        
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <Text style={styles.formLabel}>GCash Number</Text>
        <TextInput
          style={[styles.formInput, gcashError && styles.formInputError]}
          placeholder="0917 123 4567"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={gcashNumber}
          onChangeText={(text) => {
            const cleaned = text.replace(/\D/g, '');
            let formatted = cleaned;
            if (cleaned.length >= 4 && cleaned.length < 7) {
              formatted = `${cleaned.substring(0, 4)} ${cleaned.substring(4)}`;
            } else if (cleaned.length >= 7) {
              formatted = `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 11)}`;
            }
            setGcashNumber(formatted);
          }}
        />
        {gcashError && <Text style={styles.errorText}>{gcashError}</Text>}
        
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#0066cc" />
          <Text style={styles.infoText}>
            You will receive a payment confirmation via GCash. Make sure your GCash account has sufficient balance.
          </Text>
        </View>
      </View>
    );
  };
  
  const renderBankTransferForm = () => {
    const selectedBankDetails = banks.find(b => b.id === selectedBank);
    
    return (
      <View style={styles.paymentForm}>
        <Text style={styles.formLabel}>Select Bank</Text>
        {banks.map((bank) => (
          <Pressable
            key={bank.id}
            style={[
              styles.bankOption,
              selectedBank === bank.id && styles.bankOptionSelected
            ]}
            onPress={() => setSelectedBank(bank.id)}
          >
            <View style={styles.bankOptionLeft}>
              <Text style={styles.bankLogo}>{bank.logo}</Text>
              <View>
                <Text style={styles.bankName}>{bank.name}</Text>
                <Text style={styles.bankAccount}>Account: {bank.accountNumber}</Text>
              </View>
            </View>
            {selectedBank === bank.id && (
              <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
            )}
          </Pressable>
        ))}
        
        {selectedBank && (
          <>
            <View style={styles.bankInstructions}>
              <Text style={styles.instructionsTitle}>How to pay via Bank Transfer:</Text>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>Log in to your online banking app</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>Transfer the exact amount to the account above</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>Enter the reference number below after transfer</Text>
              </View>
            </View>
            
            <Text style={styles.formLabel}>Reference Number</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter transaction reference number"
              placeholderTextColor="#999"
              value={referenceNumber}
              onChangeText={setReferenceNumber}
            />
            
            <View style={styles.infoBox}>
              <Ionicons name="time-outline" size={20} color="#0066cc" />
              <Text style={styles.infoText}>
                Please allow 5-15 minutes for bank transfer confirmation. Your booking will be confirmed once payment is verified.
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };
  
  const renderPaymentMethodIcon = (methodId) => {
    switch (methodId) {
      case 'credit_card':
        return (
          <View style={styles.cardIcons}>
            <Text style={styles.cardIcon}>💳</Text>
            <Text style={styles.cardIconText}>Visa</Text>
            <Text style={styles.cardIconText}>MC</Text>
            <Text style={styles.cardIconText}>JCB</Text>
          </View>
        );
      case 'gcash':
        return <Ionicons name="phone-portrait-outline" size={24} color="#007aff" />;
      case 'bank_transfer':
        return <Ionicons name="business-outline" size={24} color="#4caf50" />;
      default:
        return null;
    }
  };
  
  if (!bookingData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4d4d" />
        <Text style={styles.errorTitle}>No booking data found</Text>
        <Text style={styles.errorMessage}>Please go back and try again</Text>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="lock-closed-outline" size={28} color="#4caf50" />
        <Text style={styles.title}>Secure Payment Portal</Text>
        <Text style={styles.subtitle}>Choose your payment method</Text>
      </View>
      
      {renderBookingSummary()}
      
      <Text style={styles.paymentMethodTitle}>Payment Method</Text>
      
      {paymentMethods.map((method) => (
        <Pressable
          key={method.id}
          style={[
            styles.paymentMethodCard,
            selectedPaymentMethod === method.id && styles.paymentMethodCardSelected
          ]}
          onPress={() => setSelectedPaymentMethod(method.id)}
        >
          <View style={styles.paymentMethodLeft}>
            <View style={[
              styles.radioCircle,
              selectedPaymentMethod === method.id && styles.radioCircleSelected
            ]}>
              {selectedPaymentMethod === method.id && (
                <View style={styles.radioCircleInner} />
              )}
            </View>
            <View>
              <Text style={styles.paymentMethodName}>{method.name}</Text>
              <Text style={styles.paymentMethodDescription}>{method.description}</Text>
            </View>
          </View>
          {renderPaymentMethodIcon(method.id)}
        </Pressable>
      ))}
      
      {selectedPaymentMethod === 'credit_card' && renderCreditCardForm()}
      {selectedPaymentMethod === 'gcash' && renderGCashForm()}
      {selectedPaymentMethod === 'bank_transfer' && renderBankTransferForm()}
      
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.payButton, (!selectedPaymentMethod || isProcessing) && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={!selectedPaymentMethod || isProcessing}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.payButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              <Text style={styles.payButtonText}>
                Pay {formatPrice(bookingData.price?.final)}
              </Text>
            </>
          )}
        </Pressable>
        
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>
      
      {/* Payment Result Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {paymentStatus === 'success' ? (
              <>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={80} color="#4caf50" />
                </View>
                <Text style={styles.modalTitle}>Payment Successful!</Text>
                <Text style={styles.modalMessage}>
                  Your booking has been confirmed. You will receive a confirmation email shortly.
                </Text>
                <View style={styles.bookingIdContainer}>
                  <Text style={styles.bookingIdLabel}>Booking ID:</Text>
                  <Text style={styles.bookingIdValue}>
                    BOOK-{Date.now().toString().slice(-8)}
                  </Text>
                </View>
                {countdown > 0 && (
                  <Text style={styles.countdownText}>
                    Redirecting in {countdown} seconds...
                  </Text>
                )}
                <Pressable style={styles.modalButton} onPress={handleCloseModal}>
                  <Text style={styles.modalButtonText}>Continue</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.errorIcon}>
                  <Ionicons name="close-circle" size={80} color="#ff4d4d" />
                </View>
                <Text style={styles.modalTitle}>Payment Failed</Text>
                <Text style={styles.modalMessage}>
                  Your payment could not be processed. Please try again or use a different payment method.
                </Text>
                <Pressable style={styles.modalButton} onPress={handleCloseModal}>
                  <Text style={styles.modalButtonText}>Try Again</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}