// components/booking/PaymentPortal.js
import { View, Text, TextInput, Pressable, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { styles } from '../../styles/PaymentPortal.styles';
import { Ionicons } from '@expo/vector-icons';
import { database } from '../../firebaseConfig';
import { ref, set, serverTimestamp, get } from 'firebase/database';
import * as SecureStore from 'expo-secure-store';
import AppModal from '../AppModal';

export default function PaymentPortal({ bookingData, onBack, onPaymentComplete }) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  
  // Modal state for payment messages
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
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
  
  // Maya Payment States
  const [mayaNumber, setMayaNumber] = useState('');
  const [mayaError, setMayaError] = useState('');
  
  // Bank Transfer States
  const [selectedBank, setSelectedBank] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  
  const [userData, setUserData] = useState(null);
  
  const banks = [
    { id: 'bpi', name: 'BPI', logo: '🏦', accountNumber: '1234-5678-9012' },
    { id: 'bdo', name: 'BDO', logo: '🏦', accountNumber: '2345-6789-0123' },
    { id: 'metrobank', name: 'Metrobank', logo: '🏦', accountNumber: '3456-7890-1234' },
    { id: 'security_bank', name: 'Security Bank', logo: '🏦', accountNumber: '4567-8901-2345' },
    { id: 'unionbank', name: 'UnionBank', logo: '🏦', accountNumber: '5678-9012-3456' },
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
      id: 'maya',
      name: 'Maya',
      icon: 'wallet-outline',
      description: 'Pay using Maya (formerly PayMaya)'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: 'business-outline',
      description: 'Bank transfer via BPI, BDO, Metrobank, etc.'
    }
  ];
  
  // Show modal helper
  const showModal = (message, isRedirectingParam = false, countdownParam = 0) => {
    setModalMessage(message);
    setIsRedirecting(isRedirectingParam);
    setCountdown(countdownParam);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setModalMessage('');
    setIsRedirecting(false);
    setCountdown(0);
  };
  
  // Load user data from SecureStore when component mounts
  useEffect(() => {
    loadUserData();
  }, []);
  
  const loadUserData = async () => {
    try {
      const userSession = await SecureStore.getItemAsync('olstarUser');
      console.log('Raw user session from SecureStore:', userSession);
      
      if (userSession) {
        const user = JSON.parse(userSession);
        setUserData(user);
        console.log('✅ Loaded user data:', user);
        console.log('✅ User UID:', user.uid);
        console.log('✅ User fullName:', user.fullName);
      } else {
        console.log('❌ No user session found in SecureStore');
      }
      setIsUserDataLoaded(true);
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsUserDataLoaded(true);
    }
  };
  
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
  
  const checkIfBookingIdExists = async (bookingId) => {
    try {
      const bookingRef = ref(database, `pendingBooking/${bookingId}`);
      const snapshot = await get(bookingRef).catch((error) => {
        if (error.code === 'PERMISSION_DENIED') {
          console.log('Permission denied, assuming ID does not exist');
          return { exists: () => false };
        }
        throw error;
      });
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking booking ID:', error);
      if (error.message?.includes('permission_denied')) {
        return false;
      }
      return false;
    }
  };

  const generateBookingId = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}-${month}-${day}`;
    
    for (let sequence = 1; sequence <= 99999; sequence++) {
      const sequenceNum = String(sequence).padStart(5, '0');
      const bookingId = `${datePrefix}-${sequenceNum}`;
      
      const exists = await checkIfBookingIdExists(bookingId);
      
      if (!exists) {
        console.log(`Available booking ID found: ${bookingId}`);
        return bookingId;
      }
    }
    
    throw new Error('No available booking IDs for today. Please try again tomorrow.');
  };
  
  const getPaymentMethodValue = (methodId) => {
    const methodMap = {
      'credit_card': 'card',
      'gcash': 'gcash',
      'maya': 'maya',
      'bank_transfer': 'bank_transfer'
    };
    return methodMap[methodId] || methodId;
  };
  
  const getTripTypeValue = (tripType) => {
    const tripMap = {
      'one_way': 'One-way',
      'round_trip': 'Round Trip',
      'tour': 'Tour'
    };
    return tripMap[tripType] || tripType;
  };
  
  const saveAirportTransferToFirebase = async (completedBooking, bookingId) => {
    const now = new Date();
    const bookingRef = ref(database, `pendingBooking/${bookingId}`);
    
    const clientId = userData?.uid || 'anonymous';
    const clientName = userData?.fullName || completedBooking.passengerDetails?.fullName || '';
    const clientEmail = completedBooking.passengerDetails?.email || '';
    
    const bookingRecord = {
      amount: parseInt(completedBooking.price?.final) || 0,
      bookingType: 'airportTransfer',
      clientId: clientId,
      clientName: clientName,
      contactNumber: completedBooking.passengerDetails?.contactNumber || '',
      date: completedBooking.date || '',
      dropoff: completedBooking.dropoffLocation || '',
      email: clientEmail,
      note: completedBooking.passengerDetails?.specialRequests || completedBooking.passengerDetails?.note || '',
      packageType: completedBooking.selectedPackage?.name || '',
      paidAt: now.toISOString(),
      passengers: parseInt(completedBooking.passengerDetails?.numPassengers) || 0,
      paymentMethod: getPaymentMethodValue(completedBooking.paymentMethod),
      paymentStatus: 'paid',
      pickup: completedBooking.pickupLocation || '',
      source: 'pending',
      status: 'unassigned',
      time: completedBooking.time || '',
      timestamp: serverTimestamp(),
    };
    
    await set(bookingRef, bookingRecord);
    console.log('Airport Transfer booking saved with ID:', bookingId);
    return bookingId;
  };
  
  const saveManilaCarRentalToFirebase = async (completedBooking, bookingId) => {
    const now = new Date();
    const bookingRef = ref(database, `pendingBooking/${bookingId}`);
    
    const clientId = userData?.uid || 'anonymous';
    const clientName = userData?.fullName || completedBooking.passengerDetails?.fullName || '';
    const clientEmail = completedBooking.passengerDetails?.email || '';
    const contactNumber = completedBooking.passengerDetails?.contactNumber || '';
    
    const packageTypeValue = completedBooking.packageOption === 'all_in' ? 'all-inclusive' : 'regular';
    const vehicleTypeValue = completedBooking.selectedVehicleType?.id?.toLowerCase() || '';
    const area = 'Manila';
    const note = completedBooking.passengerDetails?.note || '';
    
    const bookingRecord = {
      amount: parseInt(completedBooking.price?.final) || 0,
      area: area,
      bookingType: 'manilaCarRental',
      clientId: clientId,
      clientName: clientName,
      contactNumber: contactNumber,
      contacts: [{
        country: completedBooking.passengerDetails?.countryIsoCode || 'PH',
        name: clientName,
        phone: contactNumber
      }],
      country: completedBooking.passengerDetails?.countryIsoCode || 'PH',
      email: clientEmail,
      name: clientName,
      phone: contactNumber,
      dropoffLocation: completedBooking.dropoffLocation || 'Metro Manila Area',
      duration: completedBooking.selectedDuration?.name || '',
      note: note,
      package: packageTypeValue,
      packageType: packageTypeValue,
      paidAt: now.toISOString(),
      paymentMethod: getPaymentMethodValue(completedBooking.paymentMethod),
      paymentStatus: 'paid',
      pickupLocation: completedBooking.pickupLocation || 'Metro Manila Area',
      pickupTime: completedBooking.pickupTime || '',
      plannedItinerary: note,
      source: 'pending',
      status: 'unassigned',
      timestamp: serverTimestamp(),
      travelDate: completedBooking.travelDate || '',
      vehicleType: vehicleTypeValue
    };
    
    await set(bookingRef, bookingRecord);
    console.log('Manila Car Rental booking saved with ID:', bookingId);
    return bookingId;
  };
  
  const saveProvincialCarRentalToFirebase = async (completedBooking, bookingId) => {
    const now = new Date();
    const bookingRef = ref(database, `pendingBooking/${bookingId}`);
    
    const clientId = userData?.uid || 'anonymous';
    const clientName = userData?.fullName || completedBooking.passengerDetails?.fullName || '';
    const clientEmail = completedBooking.passengerDetails?.email || '';
    const contactNumber = completedBooking.passengerDetails?.contactNumber || '';
    const note = completedBooking.passengerDetails?.note || '';
    
    const vehicleTypeValue = completedBooking.selectedVehicleType?.id?.toLowerCase() || '';
    const tripTypeValue = getTripTypeValue(completedBooking.tripType);
    const destinationName = completedBooking.destination?.name || '';
    
    const bookingRecord = {
      amount: parseInt(completedBooking.price?.final) || 0,
      bookingType: 'provincialCarRental',
      clientId: clientId,
      clientName: clientName,
      contactNumber: contactNumber,
      email: clientEmail,
      note: note,
      paidAt: now.toISOString(),
      paymentMethod: getPaymentMethodValue(completedBooking.paymentMethod),
      paymentStatus: 'paid',
      pickupLocation: completedBooking.pickupLocation || '',
      travelDate: completedBooking.travelDate || '',
      pickupTime: completedBooking.pickupTime || '',
      destination: destinationName,
      destinationId: completedBooking.destination?.id || '',
      tripType: tripTypeValue,
      tripTypeId: completedBooking.tripType || '',
      vehicleType: vehicleTypeValue,
      vehicleTypeId: completedBooking.selectedVehicleType?.id || '',
      numPassengers: parseInt(completedBooking.numPassengers) || 0,
      source: 'pending',
      status: 'unassigned',
      timestamp: serverTimestamp(),
    };
    
    await set(bookingRef, bookingRecord);
    console.log('Provincial Car Rental booking saved with ID:', bookingId);
    return bookingId;
  };
  
  const saveSelfDriveCarRentalToFirebase = async (completedBooking, bookingId) => {
    const now = new Date();
    const bookingRef = ref(database, `pendingBooking/${bookingId}`);
    
    const clientId = userData?.uid || 'anonymous';
    const clientName = userData?.fullName || completedBooking.passengerDetails?.fullName || '';
    const clientEmail = completedBooking.passengerDetails?.email || '';
    
    const bookingRecord = {
      amount: parseInt(completedBooking.price?.final) || 0,
      bookingType: 'selfDriveCarRental',
      clientId: clientId,
      clientName: clientName,
      contactNumber: completedBooking.passengerDetails?.contactNumber || '',
      date: completedBooking.pickupDate || '',
      email: clientEmail,
      note: completedBooking.passengerDetails?.specialRequests || completedBooking.passengerDetails?.note || '',
      carType: completedBooking.selectedUnit?.name || '',
      paidAt: now.toISOString(),
      paymentMethod: getPaymentMethodValue(completedBooking.paymentMethod),
      paymentStatus: 'paid',
      pickup: completedBooking.pickupLocation || '',
      dropoff: completedBooking.dropoffLocation || '',
      pickupTime: completedBooking.pickupTime || '',
      returnDateTime: completedBooking.returnDate || '',
      rentalDuration: completedBooking.selectedDuration?.name || '',
      driverLicenseNumber: completedBooking.passengerDetails?.driverLicenseNumber || '',
      source: 'pending',
      status: 'unassigned',
      timestamp: serverTimestamp(),
    };
    
    await set(bookingRef, bookingRecord);
    console.log('Self Drive Car Rental booking saved with ID:', bookingId);
    return bookingId;
  };
  
  const saveBookingToFirebase = async (completedBooking) => {
    try {
      if (!isUserDataLoaded) {
        console.log('⏳ Waiting for user data to load...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const bookingId = await generateBookingId();
      const serviceType = completedBooking.serviceType;
      
      console.log('📝 Saving booking with userData:', userData);
      console.log('📝 Service type:', serviceType);
      
      switch (serviceType) {
        case 'airport':
        case 'airportTransfer':
          await saveAirportTransferToFirebase(completedBooking, bookingId);
          break;
        case 'metro':
        case 'manilaCarRental':
          await saveManilaCarRentalToFirebase(completedBooking, bookingId);
          break;
        case 'provincial':
        case 'provincialCarRental':
          await saveProvincialCarRentalToFirebase(completedBooking, bookingId);
          break;
        case 'selfdrive':
        case 'selfDriveCarRental':
          await saveSelfDriveCarRentalToFirebase(completedBooking, bookingId);
          break;
        default:
          await saveAirportTransferToFirebase(completedBooking, bookingId);
          break;
      }
      
      return bookingId;
    } catch (error) {
      console.error('Error saving booking to Firebase:', error);
      throw error;
    }
  };
  
  const validateCardDetails = () => {
    const errors = {};
    const cardNumberClean = cardDetails.cardNumber.replace(/\s/g, '');
    
    if (!cardNumberClean) {
      errors.cardNumber = 'Card number is required';
    } else if (cardNumberClean.length !== 16) {
      errors.cardNumber = 'Invalid card number';
    }
    
    if (!cardDetails.cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    }
    
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
  
  const validateMaya = () => {
    if (!mayaNumber) {
      setMayaError('Maya number is required');
      return false;
    }
    const cleaned = mayaNumber.replace(/\D/g, '');
    if (cleaned.length !== 11 && cleaned.length !== 10) {
      setMayaError('Invalid Maya number (must be 10-11 digits)');
      return false;
    }
    setMayaError('');
    return true;
  };
  
  const validateBankTransfer = () => {
    if (!selectedBank) {
      showModal('Please select a bank');
      return false;
    }
    if (!referenceNumber.trim()) {
      showModal('Please enter the reference number');
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
      case 'maya':
        isValid = validateMaya();
        break;
      case 'bank_transfer':
        isValid = validateBankTransfer();
        break;
      default:
        showModal('Please select a payment method');
        return;
    }
    
    if (!isValid) return;
    
    if (!isUserDataLoaded) {
      showModal('Loading your account information...');
      return;
    }
    
    if (!userData?.uid) {
      console.error('❌ No user UID found! User data:', userData);
      showModal('Unable to identify user. Please log in again.');
      return;
    }
    
    console.log('✅ Proceeding with payment for user:', userData.uid);
    
    setIsProcessing(true);
    
    setTimeout(async () => {
      setIsProcessing(false);
      
      const completedBooking = {
        ...bookingData,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'paid',
        paymentDate: new Date().toISOString(),
      };
      
      try {
        const savedBookingId = await saveBookingToFirebase(completedBooking);
        completedBooking.bookingId = savedBookingId;
        
        setPaymentStatus('success');
        setShowPaymentModal(true);
        
        setCountdown(3);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        onPaymentComplete(completedBooking);
        
      } catch (error) {
        console.error('Payment processing error:', error);
        setPaymentStatus('failed');
        setShowPaymentModal(true);
      }
    }, 2000);
  };
  
  const handleCloseModal = () => {
    setShowPaymentModal(false);
    if (paymentStatus === 'success') {
      // The parent will handle navigation
    }
  };
  
  const getServiceName = () => {
    if (!bookingData) return 'Car Rental';
    const serviceNames = {
      'airport': 'Airport Transfer',
      'airportTransfer': 'Airport Transfer',
      'metro': 'Metro Manila Car Rental',
      'manilaCarRental': 'Metro Manila Car Rental',
      'provincial': 'Provincial Car Rental',
      'provincialCarRental': 'Provincial Car Rental',
      'selfdrive': 'Self Drive Car Rental',
      'selfDriveCarRental': 'Self Drive Car Rental'
    };
    return serviceNames[bookingData.serviceType] || 'Car Rental';
  };
  
  const getTripTypeLabel = () => {
    if (!bookingData?.tripType) return '';
    switch(bookingData.tripType) {
      case 'one_way': return 'One-way';
      case 'round_trip': return 'Round Trip';
      case 'tour': return 'Tour';
      default: return bookingData.tripType;
    }
  };
  
  const renderBookingSummary = () => {
    if (!bookingData) return null;
    
    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service:</Text>
          <Text style={styles.summaryValue}>{getServiceName()}</Text>
        </View>
        
        {/* Provincial Car Rental specific display */}
        {bookingData.serviceType === 'provincial' && (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pickup Location:</Text>
              <Text style={styles.summaryValue}>{bookingData.pickupLocation || 'Not specified'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Destination:</Text>
              <Text style={styles.summaryValue}>{bookingData.destination?.name || 'Not specified'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Trip Type:</Text>
              <Text style={styles.summaryValue}>{getTripTypeLabel()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vehicle:</Text>
              <Text style={styles.summaryValue}>{bookingData.selectedVehicleType?.name || 'Not selected'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Travel Date:</Text>
              <Text style={styles.summaryValue}>{bookingData.travelDate || 'Not specified'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pickup Time:</Text>
              <Text style={styles.summaryValue}>{bookingData.pickupTime || 'Flexible'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Passengers:</Text>
              <Text style={styles.summaryValue}>{bookingData.numPassengers || 0}</Text>
            </View>
          </>
        )}
        
        {/* Metro Car Rental specific display */}
        {bookingData.serviceType === 'metro' && (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pickup Location:</Text>
              <Text style={styles.summaryValue}>{bookingData.pickupLocation || 'Metro Manila Area'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Dropoff Location:</Text>
              <Text style={styles.summaryValue}>{bookingData.dropoffLocation || 'Metro Manila Area'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vehicle:</Text>
              <Text style={styles.summaryValue}>{bookingData.selectedVehicleType?.name || 'Not selected'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Package:</Text>
              <Text style={styles.summaryValue}>{bookingData.packageOption === 'all_in' ? 'All-inclusive' : 'Regular'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Travel Date:</Text>
              <Text style={styles.summaryValue}>{bookingData.travelDate || 'Not specified'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pickup Time:</Text>
              <Text style={styles.summaryValue}>{bookingData.pickupTime || 'Flexible'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>{bookingData.selectedDuration?.name || 'Not specified'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Passengers:</Text>
              <Text style={styles.summaryValue}>{bookingData.numPassengers || 0}</Text>
            </View>
          </>
        )}
        
        {/* Airport Transfer specific display */}
        {bookingData.serviceType === 'airport' && (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pickup Location:</Text>
              <Text style={styles.summaryValue}>{bookingData.pickupLocation || 'Not specified'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Dropoff Location:</Text>
              <Text style={styles.summaryValue}>{bookingData.dropoffLocation || 'Not specified'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>{bookingData.date || 'Not specified'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time:</Text>
              <Text style={styles.summaryValue}>{bookingData.time || 'Flexible'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Passengers:</Text>
              <Text style={styles.summaryValue}>{bookingData.passengerDetails?.numPassengers || 0}</Text>
            </View>
          </>
        )}
        
        {/* Self Drive Car Rental specific display */}
        {bookingData.serviceType === 'selfdrive' && (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vehicle:</Text>
              <Text style={styles.summaryValue}>{bookingData.selectedUnit?.name || 'Not selected'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pickup Date & Time:</Text>
              <Text style={styles.summaryValue}>{bookingData.pickupDate} at {bookingData.pickupTime}</Text>
            </View>
            {bookingData.returnDate && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Return Date & Time:</Text>
                <Text style={styles.summaryValue}>{bookingData.returnDate}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>{bookingData.selectedDuration?.name || 'Not specified'}</Text>
            </View>
          </>
        )}
        
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Base Price:</Text>
          <Text style={styles.summaryValue}>{formatPrice(bookingData.price?.original)}</Text>
        </View>
        {bookingData.price?.discount && (
          <View style={styles.summaryRow}>
            <Text style={styles.discountLabel}>
              {bookingData.price.discount.type === 'percentage' ? `Discount (${bookingData.price.discount.value}%)` : 'Discount'}
            </Text>
            <Text style={styles.discountValue}>
              -{bookingData.price.discount.type === 'fixed' ? formatPrice(bookingData.price.discount.value) : `${bookingData.price.discount.value}%`}
            </Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{formatPrice(bookingData.price?.final)}</Text>
        </View>
      </View>
    );
  };
  
  const renderPaymentMethods = () => {
    return (
      <View style={styles.paymentMethodsContainer}>
        <Text style={styles.paymentMethodTitle}>Select Payment Method</Text>
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
                {selectedPaymentMethod === method.id && <View style={styles.radioCircleInner} />}
              </View>
              <View>
                <Text style={styles.paymentMethodName}>{method.name}</Text>
                <Text style={styles.paymentMethodDescription}>{method.description}</Text>
              </View>
            </View>
            <Ionicons name={method.icon} size={24} color="#666" />
          </Pressable>
        ))}
      </View>
    );
  };
  
  const renderCreditCardForm = () => {
    if (selectedPaymentMethod !== 'credit_card') return null;
    
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
                  setCardDetails({...cardDetails, expiryMonth: cleaned, expiryYear: ''});
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
      </View>
    );
  };
  
  const renderGCashForm = () => {
    if (selectedPaymentMethod !== 'gcash') return null;
    
    return (
      <View style={styles.paymentForm}>
        <View style={styles.gcashHeader}>
          <Ionicons name="phone-portrait-outline" size={48} color="#007aff" />
          <Text style={styles.gcashTitle}>Pay with GCash</Text>
          <Text style={styles.gcashSubtitle}>Enter your GCash number</Text>
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
      </View>
    );
  };
  
  const renderMayaForm = () => {
    if (selectedPaymentMethod !== 'maya') return null;
    
    return (
      <View style={styles.paymentForm}>
        <View style={styles.mayaHeader}>
          <Ionicons name="wallet-outline" size={48} color="#ff6b00" />
          <Text style={styles.mayaTitle}>Pay with Maya</Text>
          <Text style={styles.mayaSubtitle}>Enter your Maya number</Text>
        </View>
        
        <Text style={styles.formLabel}>Maya Number</Text>
        <TextInput
          style={[styles.formInput, mayaError && styles.formInputError]}
          placeholder="0917 123 4567"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={mayaNumber}
          onChangeText={(text) => {
            const cleaned = text.replace(/\D/g, '');
            let formatted = cleaned;
            if (cleaned.length >= 4 && cleaned.length < 7) {
              formatted = `${cleaned.substring(0, 4)} ${cleaned.substring(4)}`;
            } else if (cleaned.length >= 7) {
              formatted = `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 11)}`;
            }
            setMayaNumber(formatted);
          }}
        />
        {mayaError && <Text style={styles.errorText}>{mayaError}</Text>}
      </View>
    );
  };
  
  const renderBankTransferForm = () => {
    if (selectedPaymentMethod !== 'bank_transfer') return null;
    
    return (
      <View style={styles.paymentForm}>
        <Text style={styles.formLabel}>Select Bank</Text>
        {banks.map((bank) => (
          <Pressable
            key={bank.id}
            style={[styles.bankOption, selectedBank === bank.id && styles.bankOptionSelected]}
            onPress={() => setSelectedBank(bank.id)}
          >
            <View style={styles.bankOptionLeft}>
              <Text style={styles.bankLogo}>{bank.logo}</Text>
              <View>
                <Text style={styles.bankName}>{bank.name}</Text>
                <Text style={styles.bankAccount}>Account: {bank.accountNumber}</Text>
              </View>
            </View>
            {selectedBank === bank.id && <Ionicons name="checkmark-circle" size={24} color="#4caf50" />}
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
          </>
        )}
      </View>
    );
  };
  
  // Show loading indicator while user data is being loaded
  if (!isUserDataLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d4d" />
        <Text style={styles.loadingText}>Loading your account...</Text>
      </View>
    );
  }
  
  if (!bookingData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4d4d" />
        <Text style={styles.errorTitle}>No booking data found</Text>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }
  
  return (
    <>
      <AppModal
        visible={modalVisible}
        message={modalMessage}
        isRedirecting={isRedirecting}
        countdown={countdown}
        onClose={hideModal}
      />
      
      <ScrollView style={styles.container}>
        {renderBookingSummary()}
        {renderPaymentMethods()}
        {renderCreditCardForm()}
        {renderGCashForm()}
        {renderMayaForm()}
        {renderBankTransferForm()}
        
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
              <Text style={styles.payButtonText}>Pay {formatPrice(bookingData.price?.final)}</Text>
            )}
          </Pressable>
          
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        </View>
        
        <Modal visible={showPaymentModal} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {paymentStatus === 'success' ? (
                <>
                  <Ionicons name="checkmark-circle" size={80} color="#4caf50" />
                  <Text style={styles.modalTitle}>Payment Successful!</Text>
                  <Text style={styles.modalMessage}>Your booking has been confirmed. A confirmation email has been sent.</Text>
                  {countdown > 0 && <Text style={styles.countdownText}>Closing in {countdown} seconds...</Text>}
                  <Pressable style={styles.modalButton} onPress={handleCloseModal}>
                    <Text style={styles.modalButtonText}>Continue</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Ionicons name="close-circle" size={80} color="#ff4d4d" />
                  <Text style={styles.modalTitle}>Payment Failed</Text>
                  <Text style={styles.modalMessage}>Please try again or use a different payment method.</Text>
                  <Pressable style={styles.modalButton} onPress={handleCloseModal}>
                    <Text style={styles.modalButtonText}>Try Again</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
}