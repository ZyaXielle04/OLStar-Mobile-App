// components/booking/ProvincialForm1.js
import { View, Text, TextInput, Pressable, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { styles } from '../../styles/ProvincialForm.styles';
import { database } from '../../firebaseConfig';
import { ref, get, child, onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Constants from 'expo-constants';
import countryCodes from './countryCodes';
import countryCodesWithFlags from './countryCodes';
import AppModal from '../AppModal';

const GEOAPIFY_API_KEY = Constants?.manifest?.extra?.EXPO_PUBLIC_GEOAPIFY_API_KEY ||
  Constants?.expoConfig?.extra?.EXPO_PUBLIC_GEOAPIFY_API_KEY ||
  process.env?.EXPO_PUBLIC_GEOAPIFY_API_KEY;

export default function ProvincialForm1({ onBack, onBookNow, initialData }) {
  const [loading, setLoading] = useState(true);
  const [showExpectations, setShowExpectations] = useState(false);
  const [showConfirmBooking, setShowConfirmBooking] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  
  // Modal state - single modal for all messages
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Itinerary Fields
  const [pickupLocation, setPickupLocation] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [numPassengers, setNumPassengers] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);
  const [tripType, setTripType] = useState('one_way'); // one_way, round_trip, tour
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [originalPrice, setOriginalPrice] = useState(null);
  const [discountInfo, setDiscountInfo] = useState(null);
  const [priceNotFound, setPriceNotFound] = useState(false);
  
  // Location suggestions
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [pickupPredictions, setPickupPredictions] = useState([]);
  const [pickupPredictionsLoading, setPickupPredictionsLoading] = useState(false);
  
  // Vehicle Types with Emojis
  const vehicleTypes = [
    { id: 'Sedan', name: 'Sedan', maxPassengers: 3, emoji: '🚗' },
    { id: 'SUV_MPV', name: 'SUV / MPV', maxPassengers: 6, emoji: '🚙' },
    { id: 'Van', name: 'Van', maxPassengers: 13, emoji: '🚐' }
  ];
  
  // Realtime data storage
  const [latestRatesData, setLatestRatesData] = useState(null);
  const [latestDiscountedRates, setLatestDiscountedRates] = useState(null);
  const [latestGlobalDiscount, setLatestGlobalDiscount] = useState(null);
  
  // Passenger Details (for confirm booking)
  const [passengerDetails, setPassengerDetails] = useState({
    fullName: '',
    countryIsoCode: 'PH',
    countryCode: '+63',
    contactNumber: '',
    email: '',
    note: ''
  });
  
  // Date & Time Pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempMonth, setTempMonth] = useState(new Date().getMonth() + 1);
  const [tempDay, setTempDay] = useState(new Date().getDate());
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempHour, setTempHour] = useState(8);
  const [tempMinute, setTempMinute] = useState(0);
  
  // Phone validation
  const [phoneError, setPhoneError] = useState('');
  const [showCountryCodePicker, setShowCountryCodePicker] = useState(false);
  const [countryCodeSearch, setCountryCodeSearch] = useState('');
  
  // Refs for scroll views
  const monthScrollRef = useRef(null);
  const dayScrollRef = useRef(null);
  const yearScrollRef = useRef(null);
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  
  // State for picker item height
  const [pickerItemHeight, setPickerItemHeight] = useState(45);

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

  // Setup Firebase Realtime Listeners for provincial rates
  useEffect(() => {
    const dbRef = ref(database);
    const ratesRef = child(dbRef, '/rates/carRental/withDriver/provincial');
    const discountedRatesRef = child(dbRef, '/rates/carRental/withDriver/discountedRates/provincial');
    const discountRef = child(dbRef, '/rates/carRental/withDriver/globalDiscount');
    
    // Listen for regular rates
    const unsubscribeRates = onValue(ratesRef, (snapshot) => {
      if (snapshot.exists()) {
        const ratesData = snapshot.val();
        console.log('🔄 Real-time provincial rates update received');
        setLatestRatesData(ratesData);
        
        if (tripType && selectedVehicleType && selectedDestination) {
          calculatePriceWithData(ratesData, latestDiscountedRates, latestGlobalDiscount);
        }
      } else {
        setLatestRatesData(null);
        if (tripType && selectedVehicleType && selectedDestination) {
          setPriceNotFound(true);
          setCalculatedPrice(null);
          setOriginalPrice(null);
          setDiscountInfo(null);
        }
      }
    });
    
    // Listen for discounted rates
    const unsubscribeDiscountedRates = onValue(discountedRatesRef, (snapshot) => {
      if (snapshot.exists()) {
        const discountedData = snapshot.val();
        console.log('🔄 Real-time discounted rates update received for Provincial');
        setLatestDiscountedRates(discountedData);
        
        if (tripType && selectedVehicleType && selectedDestination && latestRatesData) {
          calculatePriceWithData(latestRatesData, discountedData, latestGlobalDiscount);
        }
      } else {
        setLatestDiscountedRates(null);
        if (tripType && selectedVehicleType && selectedDestination && latestRatesData) {
          calculatePriceWithData(latestRatesData, null, latestGlobalDiscount);
        }
      }
    });
    
    // Listen for global discount
    const unsubscribeDiscount = onValue(discountRef, (snapshot) => {
      let discountData = null;
      if (snapshot.exists()) {
        discountData = snapshot.val();
        if (discountData.active === true) {
          console.log('🔄 Real-time global discount update received for Provincial:', discountData);
          setLatestGlobalDiscount(discountData);
          
          if (tripType && selectedVehicleType && selectedDestination && latestRatesData) {
            calculatePriceWithData(latestRatesData, latestDiscountedRates, discountData);
          }
        } else {
          setLatestGlobalDiscount(null);
          if (tripType && selectedVehicleType && selectedDestination && latestRatesData) {
            calculatePriceWithData(latestRatesData, latestDiscountedRates, null);
          }
        }
      }
    });
    
    return () => {
      unsubscribeRates();
      unsubscribeDiscountedRates();
      unsubscribeDiscount();
    };
  }, [tripType, selectedVehicleType, selectedDestination]);

  // Search location predictions for pickup
  useEffect(() => {
    const query = pickupLocation.trim();
    if (query.length < 3) {
      setPickupPredictions([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetchPlacePredictions(query);
    }, 350);
    return () => clearTimeout(timeout);
  }, [pickupLocation]);

  // Load destinations on mount
  useEffect(() => {
    loadDestinations();
  }, []);

  // Restore saved data
  useEffect(() => {
    if (initialData) {
      restoreSavedData(initialData);
    }
  }, [initialData]);

  // Calculate price when dependencies change
  useEffect(() => {
    if (tripType && selectedVehicleType && selectedDestination && latestRatesData) {
      calculatePriceWithData(latestRatesData, latestDiscountedRates, latestGlobalDiscount);
    }
  }, [tripType, selectedVehicleType, selectedDestination, latestRatesData, latestDiscountedRates, latestGlobalDiscount]);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, '/rates/carRental/withDriver/provincialDestinations'));
      
      if (snapshot.exists()) {
        const destinationsData = snapshot.val();
        const destinationsList = Object.keys(destinationsData).map(key => ({
          id: key,
          ...destinationsData[key]
        })).filter(d => d.isActive !== false);
        
        setAvailableDestinations(destinationsList);
      }
    } catch (error) {
      console.error('Error loading destinations:', error);
      showModal('Failed to load destinations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlacePredictions = async (query) => {
    if (!GEOAPIFY_API_KEY) {
      console.warn('Missing EXPO_PUBLIC_GEOAPIFY_API_KEY for place predictions.');
      return;
    }

    try {
      setPickupPredictionsLoading(true);
      const params = new URLSearchParams({
        text: query,
        apiKey: GEOAPIFY_API_KEY,
        filter: 'countrycode:ph',
        lang: 'en',
        limit: '6',
        format: 'json'
      });
      const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        const results = data.results || data.features || [];
        setPickupPredictions((results || []).slice(0, 6));
      } else {
        setPickupPredictions([]);
        console.warn('Geoapify autocomplete error:', data.statusCode || response.status, data.message);
      }
    } catch (error) {
      console.error('Error loading place predictions:', error);
      setPickupPredictions([]);
    } finally {
      setPickupPredictionsLoading(false);
    }
  };

  const handleLocationSelect = (prediction) => {
    const selectedAddress = prediction.formatted || (prediction.properties && prediction.properties.formatted) || '';
    setPickupLocation(selectedAddress);
    setShowPickupSuggestions(false);
  };

  const renderPickupSuggestions = () => {
    if (!showPickupSuggestions || (!pickupPredictionsLoading && pickupPredictions.length === 0)) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <ScrollView
          style={styles.suggestionsScrollView}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {pickupPredictionsLoading && (
            <View style={styles.suggestionItem}>
              <ActivityIndicator size="small" color="#ff4d4d" />
              <Text style={styles.suggestionText}>Searching places...</Text>
            </View>
          )}
          {!pickupPredictionsLoading && pickupPredictions.map((prediction, index) => (
            <Pressable
              key={prediction?.properties?.place_id || prediction.place_id || `${prediction.formatted || ''}-${index}`}
              style={[
                styles.suggestionItem,
                index === pickupPredictions.length - 1 && styles.suggestionItemLast
              ]}
              onPress={() => handleLocationSelect(prediction)}
            >
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.suggestionText}>{prediction.formatted || (prediction.properties && prediction.properties.formatted)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };

  const handleDestinationSelect = (destination) => {
    setSelectedDestination(destination);
    setPriceNotFound(false);
  };

  const calculatePriceWithData = (ratesData, discountedRatesData, globalDiscount) => {
    if (!tripType || !selectedVehicleType || !selectedDestination) return;
    
    let vehicleKey = selectedVehicleType.id;
    let basePrice = null;
    
    // Get base price from regular rates
    if (vehicleKey === 'SUV_MPV') {
      basePrice = ratesData?.[tripType]?.['SUV']?.['MPV']?.[selectedDestination.id];
    } else {
      basePrice = ratesData?.[tripType]?.[vehicleKey]?.[selectedDestination.id];
    }
    
    if (!basePrice) {
      setPriceNotFound(true);
      setCalculatedPrice(null);
      setOriginalPrice(null);
      setDiscountInfo(null);
      return;
    }
    
    const basePriceNum = parseInt(basePrice);
    let finalPrice = basePriceNum;
    let discountInfoObj = null;
    let usedDiscountedRate = false;
    
    // FIRST: Check for discounted rates (per-vehicle/per-destination specific discounts)
    if (discountedRatesData) {
      let discountedPriceValue = null;
      
      if (vehicleKey === 'SUV_MPV') {
        discountedPriceValue = discountedRatesData?.[tripType]?.['SUV']?.['MPV']?.[selectedDestination.id];
      } else {
        discountedPriceValue = discountedRatesData?.[tripType]?.[vehicleKey]?.[selectedDestination.id];
      }
      
      if (discountedPriceValue) {
        const discountedPriceNum = parseFloat(discountedPriceValue);
        if (discountedPriceNum < basePriceNum) {
          finalPrice = discountedPriceNum;
          usedDiscountedRate = true;
          const discountAmount = basePriceNum - discountedPriceNum;
          const discountPercentage = Math.round((discountAmount / basePriceNum) * 100);
          
          discountInfoObj = {
            type: 'percentage',
            value: discountPercentage,
            originalPrice: basePriceNum,
            discountedPrice: finalPrice,
            source: 'discounted_rates'
          };
        }
      }
    }
    
    // SECOND: Apply global discount ONLY if no per-item discounted rate was found
    if (globalDiscount && globalDiscount.active === true && !usedDiscountedRate) {
      const discountValue = parseFloat(globalDiscount.value);
      if (globalDiscount.discountType === 'fixed') {
        finalPrice = Math.max(0, finalPrice - discountValue);
        discountInfoObj = {
          type: 'fixed',
          value: discountValue,
          originalPrice: basePriceNum,
          discountedPrice: finalPrice,
          source: 'global_discount'
        };
      } else if (globalDiscount.discountType === 'percentage') {
        finalPrice = Math.round(finalPrice * (1 - discountValue / 100));
        discountInfoObj = {
          type: 'percentage',
          value: discountValue,
          originalPrice: basePriceNum,
          discountedPrice: finalPrice,
          source: 'global_discount'
        };
      }
    }
    
    setPriceNotFound(false);
    setOriginalPrice(basePriceNum);
    setCalculatedPrice(Math.round(finalPrice));
    setDiscountInfo(discountInfoObj);
  };

  const validatePassengerCount = (vehicleType, passengers) => {
    const maxPassengers = vehicleType.maxPassengers;
    if (passengers > maxPassengers) {
      showModal(`This vehicle can only accommodate up to ${maxPassengers} passengers. Please select a larger vehicle or reduce passenger count.`);
      return false;
    }
    return true;
  };

  const handleVehicleSelect = (vehicle) => {
    if (numPassengers && !validatePassengerCount(vehicle, parseInt(numPassengers))) {
      return;
    }
    setSelectedVehicleType(vehicle);
    setPriceNotFound(false);
  };

  // Combined validation - shows single modal with all missing fields
  const validateItinerary = () => {
    const missingFields = [];
    
    if (!pickupLocation) missingFields.push('• Pickup Location');
    if (!travelDate) missingFields.push('• Travel Date');
    if (!pickupTime) missingFields.push('• Pickup Time');
    if (!numPassengers) missingFields.push('• Number of Passengers');
    if (!selectedVehicleType) missingFields.push('• Vehicle Type');
    if (!selectedDestination) missingFields.push('• Destination');
    
    if (missingFields.length > 0) {
      const message = `Please fill in the following fields:\n\n${missingFields.join('\n')}`;
      showModal(message);
      return false;
    }
    
    // Check if price exists for the selected combination
    if (priceNotFound) {
      const tripTypeLabel = getTripTypeLabel();
      const vehicleName = selectedVehicleType?.name || 'selected vehicle';
      const destinationName = selectedDestination?.name || 'selected destination';
      showModal(`⚠️ Price not available for ${tripTypeLabel} trip to ${destinationName} with ${vehicleName}.\n\nPlease select a different vehicle type or destination, or contact support for assistance.`);
      return false;
    }
    
    if (numPassengers && selectedVehicleType && !validatePassengerCount(selectedVehicleType, parseInt(numPassengers))) {
      return false;
    }
    
    return true;
  };

  const handleProceedToExpectations = () => {
    if (validateItinerary()) {
      setShowExpectations(true);
    }
  };

  const handleConfirmFromExpectations = () => {
    if (!hasAgreed) {
      showModal('Please agree to the terms and conditions to proceed.');
      return;
    }
    setShowConfirmBooking(true);
  };

  const validatePassengerDetails = () => {
    const missingFields = [];
    
    if (!passengerDetails.fullName.trim()) missingFields.push('• Full Name');
    if (!passengerDetails.email.trim()) missingFields.push('• Email Address');
    if (!passengerDetails.contactNumber.trim()) missingFields.push('• WhatsApp Number');
    
    if (missingFields.length > 0) {
      const message = `Please fill in the following details:\n\n${missingFields.join('\n')}`;
      showModal(message);
      return false;
    }
    
    return true;
  };

  const handleConfirmBooking = () => {
    const phoneValidation = validatePhoneNumber();
    
    if (!validatePassengerDetails()) return;
    if (!phoneValidation.isValid) return;
    
    const bookingData = {
      serviceType: 'provincial',
      pickupLocation,
      travelDate,
      pickupTime,
      numPassengers: parseInt(numPassengers),
      selectedVehicleType,
      tripType,
      destination: selectedDestination,
      price: {
        original: originalPrice,
        final: calculatedPrice,
        discount: discountInfo
      },
      passengerDetails: {
        ...passengerDetails,
        contactNumber: phoneValidation.formattedNumber
      },
      bookingStatus: 'pending',
      timestamp: new Date().toISOString()
    };
    
    onBookNow?.(bookingData);
  };

  const validatePhoneNumber = (shouldSetError = true) => {
    const localNumber = passengerDetails.contactNumber.trim();
    if (!localNumber) {
      if (shouldSetError) setPhoneError('Contact number is required');
      return { isValid: false, formattedNumber: '' };
    }
    const phoneNumber = parsePhoneNumberFromString(localNumber, passengerDetails.countryIsoCode);
    if (!phoneNumber || !phoneNumber.isValid()) {
      if (shouldSetError) {
        showModal(`Enter a valid ${passengerDetails.countryCode} phone number`);
        setPhoneError(`Enter a valid ${passengerDetails.countryCode} phone number`);
      }
      return { isValid: false, formattedNumber: '' };
    }
    if (shouldSetError) setPhoneError('');
    return { isValid: true, formattedNumber: phoneNumber.number };
  };

  const restoreSavedData = (data) => {
    if (data.pickupLocation) setPickupLocation(data.pickupLocation);
    if (data.travelDate) setTravelDate(data.travelDate);
    if (data.pickupTime) setPickupTime(data.pickupTime);
    if (data.numPassengers) setNumPassengers(data.numPassengers.toString());
    if (data.selectedVehicleType) setSelectedVehicleType(data.selectedVehicleType);
    if (data.tripType) setTripType(data.tripType);
    if (data.destination) setSelectedDestination(data.destination);
    if (data.passengerDetails) setPassengerDetails(prev => ({ ...prev, ...data.passengerDetails }));
    if (data.price) {
      if (data.price.original) setOriginalPrice(data.price.original);
      if (data.price.final) setCalculatedPrice(data.price.final);
      if (data.price.discount) setDiscountInfo(data.price.discount);
    }
  };

  const formatDate = (month, day, year) => {
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    return `${formattedMonth}-${formattedDay}-${year}`;
  };

  const formatTime = (hour, minute) => {
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    return `${formattedHour}:${formattedMinute}`;
  };

  const formatPrice = (price) => {
    if (!price) return '₱0';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Generate data for pickers
  const months = Array.from({ length: 12 }, (_, i) => ({ label: (i + 1).toString().padStart(2, '0'), value: i + 1 }));
  const years = Array.from({ length: 6 }, (_, i) => ({ label: (new Date().getFullYear() + i).toString(), value: new Date().getFullYear() + i }));
  const hours = Array.from({ length: 24 }, (_, i) => ({ label: i.toString().padStart(2, '0'), value: i }));
  const minutes = Array.from({ length: 60 }, (_, i) => ({ label: i.toString().padStart(2, '0'), value: i }));

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(tempMonth, tempYear) }, (_, i) => ({ 
    label: (i + 1).toString().padStart(2, '0'), 
    value: i + 1 
  }));

  const handleConfirmDate = () => {
    const newDate = formatDate(tempMonth, tempDay, tempYear);
    setTravelDate(newDate);
    setShowDatePicker(false);
  };

  const handleConfirmTime = () => {
    const newTime = formatTime(tempHour, tempMinute);
    setPickupTime(newTime);
    setShowTimePicker(false);
  };

  const renderPickerItem = (item, selectedValue, onSelect, labelKey = 'label', valueKey = 'value') => (
    <Pressable
      key={item[valueKey]}
      style={[
        styles.numberPickerItem,
        selectedValue === item[valueKey] && styles.numberPickerItemSelected
      ]}
      onPress={() => onSelect(item[valueKey])}
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        if (height !== pickerItemHeight && height > 0) {
          setPickerItemHeight(height);
        }
      }}
    >
      <Text style={[
        styles.numberPickerText,
        selectedValue === item[valueKey] && styles.numberPickerTextSelected
      ]}>
        {item[labelKey]}
      </Text>
    </Pressable>
  );

  const selectedCountry = countryCodes.find(c => c.code === passengerDetails.countryIsoCode);
  const filteredCountryCodes = countryCodesWithFlags.filter((country) => {
    const query = countryCodeSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      country.name.toLowerCase().includes(query) ||
      country.code.toLowerCase().includes(query) ||
      country.dialCode.includes(query)
    );
  });

  const getTripTypeLabel = () => {
    switch(tripType) {
      case 'one_way': return 'One-way';
      case 'round_trip': return 'Round Trip';
      case 'tour': return 'Tour';
      default: return 'One-way';
    }
  };

  // Render Itinerary Section
  const renderItinerarySection = () => (
    <View style={[styles.section, { overflow: 'visible', zIndex: 1 }]}>
      <Text style={styles.sectionTitle}>Trip Details</Text>
      
      {/* Pickup Location */}
      <Text style={styles.label}>Pickup Location *</Text>
      <View style={[styles.autocompleteWrapper, { zIndex: 9999, overflow: 'visible' }]}>
        <TextInput 
          style={styles.input}
          placeholder="Enter pickup location"
          placeholderTextColor="#999"
          value={pickupLocation}
          onChangeText={setPickupLocation}
          onFocus={() => setShowPickupSuggestions(true)}
        />
        {renderPickupSuggestions()}
      </View>
      
      <Text style={styles.label}>Travel Date *</Text>
      <Pressable style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
        <Text style={travelDate ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
          {travelDate || "Select Travel Date"}
        </Text>
      </Pressable>
      
      <Text style={styles.label}>Pickup Time *</Text>
      <Pressable style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
        <Text style={pickupTime ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
          {pickupTime || "Select Pickup Time"}
        </Text>
      </Pressable>
      
      <Text style={styles.label}>Number of Passengers *</Text>
      <TextInput 
        style={styles.input}
        placeholder="Enter number of passengers"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={numPassengers}
        onChangeText={(text) => {
          const value = text.replace(/\D/g, '');
          setNumPassengers(value);
          if (selectedVehicleType && value) {
            validatePassengerCount(selectedVehicleType, parseInt(value));
          }
        }}
      />
      
      <Text style={styles.label}>Trip Type *</Text>
      <View style={styles.tripTypeGroup}>
        <Pressable
          style={[styles.tripTypeOption, tripType === 'one_way' && styles.tripTypeOptionSelected]}
          onPress={() => setTripType('one_way')}
        >
          <Text style={[styles.tripTypeLabel, tripType === 'one_way' && styles.tripTypeLabelSelected]}>
            One-way
          </Text>
        </Pressable>
        
        <Pressable
          style={[styles.tripTypeOption, tripType === 'round_trip' && styles.tripTypeOptionSelected]}
          onPress={() => setTripType('round_trip')}
        >
          <Text style={[styles.tripTypeLabel, tripType === 'round_trip' && styles.tripTypeLabelSelected]}>
            Round Trip
          </Text>
        </Pressable>
        
        <Pressable
          style={[styles.tripTypeOption, tripType === 'tour' && styles.tripTypeOptionSelected]}
          onPress={() => setTripType('tour')}
        >
          <Text style={[styles.tripTypeLabel, tripType === 'tour' && styles.tripTypeLabelSelected]}>
            Tour
          </Text>
        </Pressable>
      </View>
      
      <Text style={styles.label}>Destination *</Text>
      <Text style={styles.fieldNote}>Select your destination</Text>
      <View style={styles.destinationsGroup}>
        {availableDestinations.map((destination) => {
          const isSelected = selectedDestination?.id === destination.id;
          return (
            <Pressable
              key={destination.id}
              style={[
                styles.destinationOption,
                isSelected && styles.destinationOptionSelected
              ]}
              onPress={() => handleDestinationSelect(destination)}
            >
              <Text style={[styles.destinationLabel, isSelected && styles.destinationLabelSelected]}>
                {destination.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      
      {selectedDestination && (
        <View style={styles.selectedDestinationsBadge}>
          <Text style={styles.selectedDestinationsText}>
            Selected: {selectedDestination.name}
          </Text>
        </View>
      )}
      
      <Text style={styles.label}>Select Vehicle Type *</Text>
      <View style={styles.vehicleGroup}>
        {vehicleTypes.map((vehicle) => {
          const isSelected = selectedVehicleType?.id === vehicle.id;
          const passengerCount = numPassengers ? parseInt(numPassengers) : 0;
          const isDisabled = !!(passengerCount > 0 && passengerCount > vehicle.maxPassengers);
          
          return (
            <Pressable
              key={vehicle.id}
              style={[
                styles.vehicleCard,
                isSelected && styles.vehicleCardSelected,
                isDisabled && styles.vehicleCardDisabled
              ]}
              onPress={() => !isDisabled && handleVehicleSelect(vehicle)}
              disabled={isDisabled}
            >
              <Text style={styles.vehicleEmoji}>{vehicle.emoji}</Text>
              <Text style={[styles.vehicleName, isSelected && styles.vehicleNameSelected, isDisabled && styles.vehicleNameDisabled]}>
                {vehicle.name}
              </Text>
              <Text style={[styles.vehicleCapacity, isDisabled && styles.vehicleCapacityDisabled]}>
                Max {vehicle.maxPassengers} pax
              </Text>
              {selectedVehicleType && calculatedPrice && isSelected && (
                <Text style={styles.vehiclePrice}>{formatPrice(calculatedPrice)}</Text>
              )}
              {selectedVehicleType && priceNotFound && isSelected && (
                <Text style={styles.priceNotFoundText}>Price not available</Text>
              )}
              {isDisabled && (
                <Text style={styles.vehicleWarning}>Too many passengers</Text>
              )}
            </Pressable>
          );
        })}
      </View>
      
      {priceNotFound && selectedVehicleType && selectedDestination && (
        <View style={styles.priceNotFoundBox}>
          <Ionicons name="alert-circle" size={24} color="#ff9800" />
          <Text style={styles.priceNotFoundBoxText}>
            Price not available for {getTripTypeLabel()} trip to {selectedDestination.name} with {selectedVehicleType.name}. Please select a different combination.
          </Text>
        </View>
      )}
      
      {selectedVehicleType && calculatedPrice && selectedDestination && !priceNotFound && (
        <View style={styles.pricePreview}>
          <Text style={styles.pricePreviewTitle}>Estimated Price</Text>
          {discountInfo ? (
            <>
              <Text style={styles.originalPricePreview}>{formatPrice(originalPrice)}</Text>
              <Text style={styles.discountedPricePreview}>{formatPrice(calculatedPrice)}</Text>
              {discountInfo.type === 'fixed' && (
                <Text style={styles.discountBadge}>₱{discountInfo.value} OFF</Text>
              )}
              {discountInfo.type === 'percentage' && (
                <Text style={styles.discountBadge}>{discountInfo.value}% OFF</Text>
              )}
            </>
          ) : (
            <Text style={styles.pricePreviewValue}>{formatPrice(calculatedPrice)}</Text>
          )}
          <Text style={styles.pricePreviewNote}>
            for {getTripTypeLabel()} trip to {selectedDestination.name}
          </Text>
        </View>
      )}
      
      <Pressable 
        style={[styles.nextButton, (priceNotFound || !calculatedPrice) && styles.nextButtonDisabled]} 
        onPress={handleProceedToExpectations}
        disabled={priceNotFound || !calculatedPrice}
      >
        <Text style={styles.nextButtonText}>Confirm</Text>
      </Pressable>
    </View>
  );

  // Render Expectations Section
  const renderExpectationsSection = () => (
    <View style={styles.section}>
      <Pressable onPress={() => setShowExpectations(false)} style={styles.backButtonSmall}>
        <Ionicons name="arrow-back" size={20} color="#ff4d4d" />
        <Text style={styles.backButtonSmallText}>Back to Itinerary</Text>
      </Pressable>
      
      <Text style={styles.sectionTitle}>What to Expect</Text>
      
      <View style={styles.packageSummaryBox}>
        <Text style={styles.packageSummaryTitle}>Trip Type: {getTripTypeLabel()}</Text>
        <Text style={styles.packageSummaryDesc}>
          {tripType === 'tour' 
            ? 'Multi-destination tour with professional driver' 
            : tripType === 'round_trip' 
            ? 'Round trip service with return to pickup location' 
            : 'One-way service to your destination'}
        </Text>
        <Text style={styles.packageSummaryDesc}>Destination: {selectedDestination?.name}</Text>
      </View>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>✨ Inclusions</Text>
        <View style={styles.bulletPoint}>
          <Ionicons name="checkmark-circle" size={18} color="#4caf50" />
          <Text style={styles.bulletText}>Professional driver</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="checkmark-circle" size={18} color="#4caf50" />
          <Text style={styles.bulletText}>Vehicle Insurance</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="checkmark-circle" size={18} color="#4caf50" />
          <Text style={styles.bulletText}>Flexible Itinerary</Text>
        </View>
      </View>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>❌ Exclusions</Text>
        <View style={styles.bulletPoint}>
          <Ionicons name="close-circle" size={18} color="#ff9800" />
          <Text style={styles.bulletText}>Fuel costs (must be returned full).</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="close-circle" size={18} color="#ff9800" />
          <Text style={styles.bulletText}>Driver's meal.</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="close-circle" size={18} color="#ff9800" />
          <Text style={styles.bulletText}>Parking fees (to be paid by customer)</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="close-circle" size={18} color="#ff9800" />
          <Text style={styles.bulletText}>Toll fees (additional - to be paid by customer)</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="close-circle" size={18} color="#ff9800" />
          <Text style={styles.bulletText}>Entrance fees to attractions/establishments.</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="close-circle" size={18} color="#ff9800" />
          <Text style={styles.bulletText}>Tips and gratuity (optional).</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="close-circle" size={18} color="#ff9800" />
          <Text style={styles.bulletText}>Overtime fees (PHP 300/hr).</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>What to expect</Text>
        <View style={styles.bulletPoint}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#2196f3" />
          <Text style={styles.bulletText}>Punctual and professional service from our experienced drivers.</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#2196f3" />
          <Text style={styles.bulletText}>A stress-free journey allowing you to focus on your destination.</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#2196f3" />
          <Text style={styles.bulletText}>Well-maintained, clean, and air-conditioned vehicles for your comfort.</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#2196f3" />
          <Text style={styles.bulletText}>Flexibility to adjust your steps within the chosen service area.</Text>
        </View>
      </View>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>📋 Terms & Conditions</Text>
        <View style={styles.bulletPoint}>
          <Ionicons name="time-outline" size={18} color="#2196f3" />
          <Text style={styles.bulletText}>Cancellation must be made at least 24 hours before the scheduled pickup.</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="time-outline" size={18} color="#2196f3" />
          <Text style={styles.bulletText}>Night surcharge of PHP 500 applies for pickups between 10:00PM and 5:00AM.</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="time-outline" size={18} color="#2196f3" />
          <Text style={styles.bulletText}>The driver has the right to refuse routes that are deemed unsafe or inaccessible.</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="car-outline" size={18} color="#2196f3" />
          <Text style={styles.bulletText}>Smoking and alcohol consumption inside the vehicle are strictly prohibited.</Text>
        </View>
        <View style={styles.bulletPoint}>
          <Ionicons name="car-outline" size={18} color="#2196f3" />
          <Text style={styles.bulletText}>Any damage to the vehicle caused by the passenger will be charged accordingly.</Text>
        </View>
      </View>
      
      <Pressable
        style={styles.agreementRow}
        onPress={() => setHasAgreed(!hasAgreed)}
      >
        <View style={[styles.checkbox, hasAgreed && styles.checkboxChecked]}>
          {hasAgreed && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <Text style={styles.agreementText}>
          I have read and agree to the terms and conditions above.
        </Text>
      </Pressable>
      
      <Pressable style={styles.confirmExpectationsButton} onPress={handleConfirmFromExpectations}>
        <Text style={styles.confirmExpectationsButtonText}>Proceed to Booking</Text>
      </Pressable>
    </View>
  );

  // Render Confirm Booking Section
  const renderConfirmBookingSection = () => (
    <View>
      <Pressable onPress={() => setShowConfirmBooking(false)} style={styles.backButtonSmall}>
        <Ionicons name="arrow-back" size={20} color="#ff4d4d" />
        <Text style={styles.backButtonSmallText}>Back to Expectations</Text>
      </Pressable>
      
      <Text style={styles.sectionTitle}>Confirm Booking</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Trip Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pickup Location:</Text>
          <Text style={styles.summaryValue}>{pickupLocation}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Destination:</Text>
          <Text style={styles.summaryValue}>{selectedDestination?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Trip Type:</Text>
          <Text style={styles.summaryValue}>{getTripTypeLabel()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Vehicle:</Text>
          <Text style={styles.summaryValue}>{selectedVehicleType?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date:</Text>
          <Text style={styles.summaryValue}>{travelDate}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Time:</Text>
          <Text style={styles.summaryValue}>{pickupTime}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Passengers:</Text>
          <Text style={styles.summaryValue}>{numPassengers}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Base Price:</Text>
          <Text style={styles.summaryValue}>{formatPrice(originalPrice)}</Text>
        </View>
        {discountInfo && (
          <View style={styles.summaryRow}>
            <Text style={styles.discountLabel}>
              {discountInfo.type === 'percentage' ? `Discount (${discountInfo.value}%)` : 'Discount'}
            </Text>
            <Text style={styles.discountValue}>
              -{discountInfo.type === 'fixed' ? formatPrice(discountInfo.value) : `${discountInfo.value}%`}
            </Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{formatPrice(calculatedPrice)}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Passenger Details</Text>
        
        <Text style={styles.label}>Full Name *</Text>
        <TextInput 
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#999"
          value={passengerDetails.fullName}
          onChangeText={(text) => setPassengerDetails({...passengerDetails, fullName: text})}
        />
        
        <Text style={styles.label}>Email Address *</Text>
        <TextInput 
          style={styles.input}
          placeholder="Enter your email address"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={passengerDetails.email}
          onChangeText={(text) => setPassengerDetails({...passengerDetails, email: text})}
        />
        
        <Text style={styles.label}>WhatsApp Number *</Text>
        <View style={styles.phoneInputRow}>
          <Pressable
            style={styles.countryCodeButton}
            onPress={() => setShowCountryCodePicker(true)}
          >
            <Text style={styles.countryCodeText}>{selectedCountry?.flag ? `${selectedCountry.flag} ${passengerDetails.countryCode}` : passengerDetails.countryCode}</Text>
            <Ionicons name="chevron-down" size={16} color="#555" />
          </Pressable>
          <TextInput 
            style={[styles.input, styles.phoneNumberInput]}
            placeholder="Enter your WhatsApp number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={passengerDetails.contactNumber}
            onChangeText={(text) => setPassengerDetails({...passengerDetails, contactNumber: text.replace(/\D/g, '')})}
            onBlur={() => validatePhoneNumber()}
          />
        </View>
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
        
        <Text style={styles.label}>Note (Optional)</Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder="Any special requests? (e.g., child seat, route preference, etc.)"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          value={passengerDetails.note}
          onChangeText={(text) => setPassengerDetails({...passengerDetails, note: text})}
        />
      </View>
      
      <Pressable style={styles.confirmButton} onPress={handleConfirmBooking}>
        <Text style={styles.confirmButtonText}>Confirm Booking</Text>
      </Pressable>
    </View>
  );

  if (loading && availableDestinations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d4d" />
        <Text style={styles.loadingText}>Loading destinations...</Text>
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
      
      <ScrollView 
        style={styles.container} 
        nestedScrollEnabled={true} 
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollViewContent}
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={true}
      >
        {showConfirmBooking ? (
          renderConfirmBookingSection()
        ) : showExpectations ? (
          renderExpectationsSection()
        ) : (
          renderItinerarySection()
        )}
        
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Cancel</Text>
        </Pressable>
        
        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Travel Date</Text>
              
              <View style={styles.pickerContainer}>
                <View style={styles.pickerWrapper}>
                  <Text style={styles.pickerLabelText}>Month</Text>
                  <ScrollView 
                    ref={monthScrollRef}
                    style={styles.numberPicker}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={pickerItemHeight}
                    decelerationRate="fast"
                  >
                    {months.map((month) => renderPickerItem(month, tempMonth, setTempMonth))}
                  </ScrollView>
                </View>

                <View style={styles.pickerWrapper}>
                  <Text style={styles.pickerLabelText}>Day</Text>
                  <ScrollView 
                    ref={dayScrollRef}
                    style={styles.numberPicker}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={pickerItemHeight}
                    decelerationRate="fast"
                  >
                    {days.map((day) => renderPickerItem(day, tempDay, setTempDay))}
                  </ScrollView>
                </View>

                <View style={styles.pickerWrapper}>
                  <Text style={styles.pickerLabelText}>Year</Text>
                  <ScrollView 
                    ref={yearScrollRef}
                    style={styles.numberPicker}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={pickerItemHeight}
                    decelerationRate="fast"
                  >
                    {years.map((year) => renderPickerItem(year, tempYear, setTempYear))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <Pressable style={styles.modalButtonCancel} onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalButtonConfirm} onPress={handleConfirmDate}>
                  <Text style={styles.modalButtonTextConfirm}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Time Picker Modal */}
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Pickup Time</Text>
              
              <View style={styles.pickerContainer}>
                <View style={styles.pickerWrapper}>
                  <Text style={styles.pickerLabelText}>Hour</Text>
                  <ScrollView 
                    ref={hourScrollRef}
                    style={styles.numberPicker}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={pickerItemHeight}
                    decelerationRate="fast"
                  >
                    {hours.map((hour) => renderPickerItem(hour, tempHour, setTempHour))}
                  </ScrollView>
                </View>

                <View style={styles.pickerWrapper}>
                  <Text style={styles.pickerLabelText}>Minute</Text>
                  <ScrollView 
                    ref={minuteScrollRef}
                    style={styles.numberPicker}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={pickerItemHeight}
                    decelerationRate="fast"
                  >
                    {minutes.map((minute) => renderPickerItem(minute, tempMinute, setTempMinute))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <Pressable style={styles.modalButtonCancel} onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalButtonConfirm} onPress={handleConfirmTime}>
                  <Text style={styles.modalButtonTextConfirm}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Country Code Picker Modal */}
        <Modal
          visible={showCountryCodePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCountryCodePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TextInput
                style={styles.countryCodeSearchInput}
                placeholder="Search country or code"
                placeholderTextColor="#999"
                value={countryCodeSearch}
                onChangeText={setCountryCodeSearch}
              />
              <ScrollView style={styles.countryCodeList}>
                {filteredCountryCodes.map((country) => (
                  <Pressable
                    key={`${country.code}-${country.dialCode}`}
                    style={[
                      styles.countryCodeOption,
                      passengerDetails.countryIsoCode === country.code && styles.countryCodeOptionSelected
                    ]}
                    onPress={() => {
                      setPassengerDetails({
                        ...passengerDetails,
                        countryIsoCode: country.code,
                        countryCode: country.dialCode
                      });
                      setShowCountryCodePicker(false);
                      setCountryCodeSearch('');
                    }}
                  >
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={[styles.countryCodeOptionText, {marginRight: 8}]}> {country.flag} {country.name}</Text>
                      <Text style={styles.countryCodeOptionDialCode}>{country.dialCode}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
              <Pressable
                style={styles.modalButtonCancel}
                onPress={() => {
                  setShowCountryCodePicker(false);
                  setCountryCodeSearch('');
                }}
              > 
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
}