// components/booking/SelfDriveForm1.js
import { View, Text, TextInput, Pressable, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { styles } from '../../styles/SelfDriveForm.styles';
import { database } from '../../firebaseConfig';
import { ref, get, child, onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Constants from 'expo-constants';
import countryCodes from './countryCodes';
import countryCodesWithFlags from './countryCodes';

const GEOAPIFY_API_KEY = Constants?.expoConfig?.extra?.geoapifyApiKey || 
                        Constants?.manifest?.extra?.geoapifyApiKey ||
                        "YOUR_HARDCODED_API_KEY_HERE"; // Fallback for now

console.log('API Key loaded:', GEOAPIFY_API_KEY ? '✅ Yes' : '❌ No');

export default function SelfDriveForm1({ onBack, onBookNow, initialData }) {
  const [loading, setLoading] = useState(true);
  const [showUnitSelection, setShowUnitSelection] = useState(false);
  const [showConfirmBooking, setShowConfirmBooking] = useState(false);
  
  // Itinerary Fields
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [availableDurations, setAvailableDurations] = useState([]);
  const [pickupLocationError, setPickupLocationError] = useState('');
  const [dropoffLocationError, setDropoffLocationError] = useState('');
  
  // Location suggestions
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [pickupPredictions, setPickupPredictions] = useState([]);
  const [dropoffPredictions, setDropoffPredictions] = useState([]);
  const [pickupPredictionsLoading, setPickupPredictionsLoading] = useState(false);
  const [dropoffPredictionsLoading, setDropoffPredictionsLoading] = useState(false);
  
  // Available Locations for rate calculation
  const [availableLocations, setAvailableLocations] = useState([]);
  const [selectedPickupArea, setSelectedPickupArea] = useState(null);
  const [selectedDropoffArea, setSelectedDropoffArea] = useState(null);
  
  // Transport Units
  const [transportUnits, setTransportUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [originalPrice, setOriginalPrice] = useState(null);
  const [discountInfo, setDiscountInfo] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  
  // Realtime data storage
  const [latestRatesData, setLatestRatesData] = useState(null);
  const [latestGlobalDiscount, setLatestGlobalDiscount] = useState(null);
  
  // Passenger Details (for confirm booking)
  const [passengerDetails, setPassengerDetails] = useState({
    fullName: '',
    countryIsoCode: 'PH',
    countryCode: '+63',
    contactNumber: '',
    email: '',
    driverLicenseNumber: '',  // Add this
    specialRequests: ''
  });
  
  // Pickup Date & Time Pickers
  const [showPickupDatePicker, setShowPickupDatePicker] = useState(false);
  const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
  const [tempPickupMonth, setTempPickupMonth] = useState(new Date().getMonth() + 1);
  const [tempPickupDay, setTempPickupDay] = useState(new Date().getDate());
  const [tempPickupYear, setTempPickupYear] = useState(new Date().getFullYear());
  const [tempPickupHour, setTempPickupHour] = useState(8);
  const [tempPickupMinute, setTempPickupMinute] = useState(0);
  
  // Phone validation
  const [phoneError, setPhoneError] = useState('');
  const [showCountryCodePicker, setShowCountryCodePicker] = useState(false);
  const [countryCodeSearch, setCountryCodeSearch] = useState('');
  
  // Refs for scroll views
  const pickupMonthScrollRef = useRef(null);
  const pickupDayScrollRef = useRef(null);
  const pickupYearScrollRef = useRef(null);
  const pickupHourScrollRef = useRef(null);
  const pickupMinuteScrollRef = useRef(null);
  
  // State for picker item height
  const [pickerItemHeight, setPickerItemHeight] = useState(45);

  // Setup Firebase Realtime Listeners
  useEffect(() => {
    const dbRef = ref(database);
    const ratesRef = child(dbRef, '/rates/carRental/selfDrive/transportUnitRates');
    const discountRef = child(dbRef, '/rates/carRental/selfDrive/globalDiscount');
    
    // Listen for realtime updates to transportUnitRates
    const unsubscribeRates = onValue(ratesRef, (snapshot) => {
      if (snapshot.exists()) {
        const ratesData = snapshot.val();
        console.log('🔄 Real-time rates update received');
        setLatestRatesData(ratesData);
        
        // If we're currently showing units, refresh them automatically
        if (selectedPickupArea && selectedDuration && showUnitSelection) {
          // Get the latest global discount from state
          const currentDiscount = latestGlobalDiscount;
          filterAvailableUnitsWithData(ratesData, currentDiscount);
        }
      }
    });
    
    // Listen for realtime updates to global discount
    const unsubscribeDiscount = onValue(discountRef, (snapshot) => {
      let discountData = null;
      if (snapshot.exists()) {
        discountData = snapshot.val();
        if (discountData.active === true) {
          console.log('🔄 Real-time global discount update received:', discountData);
          setLatestGlobalDiscount(discountData);
          
          // If we're currently showing units, refresh them automatically with the new discount
          if (selectedPickupArea && selectedDuration && showUnitSelection && latestRatesData) {
            filterAvailableUnitsWithData(latestRatesData, discountData);
          }
        } else {
          // Discount is not active, clear it
          setLatestGlobalDiscount(null);
          if (selectedPickupArea && selectedDuration && showUnitSelection && latestRatesData) {
            filterAvailableUnitsWithData(latestRatesData, null);
          }
        }
      }
    });
    
    // Cleanup listeners on unmount
    return () => {
      unsubscribeRates();
      unsubscribeDiscount();
    };
  }, [selectedPickupArea, selectedDuration, showUnitSelection]);

  // Watch for filteredUnits changes to update selected unit
  useEffect(() => {
    if (selectedUnit && filteredUnits.length > 0) {
      const updatedUnit = filteredUnits.find(u => u.id === selectedUnit.id);
      if (updatedUnit) {
        const oldPrice = selectedUnit.discountedPrice || selectedUnit.basePrice;
        const newPrice = updatedUnit.discountedPrice || updatedUnit.basePrice;
        if (oldPrice !== newPrice) {
          console.log(`🔄 Selected unit price changed: ${oldPrice} -> ${newPrice}`);
          updateSelectedUnitPrice(updatedUnit);
        }
      }
    }
  }, [filteredUnits]);

  // Separate function to update selected unit price without causing loops
  const updateSelectedUnitPrice = (unit) => {
    setSelectedUnit(unit);
    
    if (unit.discountedPrice) {
      setCalculatedPrice(unit.discountedPrice + deliveryFee);
      setOriginalPrice(unit.basePrice);
      setDiscountInfo(unit.discountInfo || {
        type: 'fixed',
        value: unit.basePrice - unit.discountedPrice,
        originalPrice: unit.basePrice,
        discountedPrice: unit.discountedPrice
      });
    } else {
      setCalculatedPrice(unit.basePrice + deliveryFee);
      setOriginalPrice(unit.basePrice);
      setDiscountInfo(null);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadDurations();
    loadLocations();
    loadTransportUnits();
  }, []);

  // Restore saved data
  useEffect(() => {
    if (initialData) {
      restoreSavedData(initialData);
    }
  }, [initialData]);

  // Auto-calculate return date when pickup date/time and duration change
  useEffect(() => {
    if (pickupDate && pickupTime && selectedDuration) {
      calculateReturnDate();
    }
  }, [pickupDate, pickupTime, selectedDuration]);

  // Search location predictions
  useEffect(() => {
    const query = pickupLocation.trim();
    if (query.length < 3) {
      setPickupPredictions([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetchPlacePredictions(query, 'pickup');
    }, 350);
    return () => clearTimeout(timeout);
  }, [pickupLocation]);

  useEffect(() => {
    const query = dropoffLocation.trim();
    if (query.length < 3) {
      setDropoffPredictions([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetchPlacePredictions(query, 'dropoff');
    }, 350);
    return () => clearTimeout(timeout);
  }, [dropoffLocation]);

  // Auto-scroll to selected values when date picker opens
  useEffect(() => {
    if (showPickupDatePicker) {
      setTimeout(() => {
        const monthIndex = months.findIndex(m => m.value === tempPickupMonth);
        if (pickupMonthScrollRef.current && monthIndex !== -1) {
          pickupMonthScrollRef.current.scrollTo({ y: monthIndex * pickerItemHeight, animated: true });
        }
        const dayIndex = pickupDays.findIndex(d => d.value === tempPickupDay);
        if (pickupDayScrollRef.current && dayIndex !== -1) {
          pickupDayScrollRef.current.scrollTo({ y: dayIndex * pickerItemHeight, animated: true });
        }
        const yearIndex = years.findIndex(y => y.value === tempPickupYear);
        if (pickupYearScrollRef.current && yearIndex !== -1) {
          pickupYearScrollRef.current.scrollTo({ y: yearIndex * pickerItemHeight, animated: true });
        }
      }, 100);
    }
  }, [showPickupDatePicker]);

  // Auto-scroll to selected values when time picker opens
  useEffect(() => {
    if (showPickupTimePicker) {
      setTimeout(() => {
        const hourIndex = hours.findIndex(h => h.value === tempPickupHour);
        if (pickupHourScrollRef.current && hourIndex !== -1) {
          pickupHourScrollRef.current.scrollTo({ y: hourIndex * pickerItemHeight, animated: true });
        }
        const minuteIndex = minutes.findIndex(m => m.value === tempPickupMinute);
        if (pickupMinuteScrollRef.current && minuteIndex !== -1) {
          pickupMinuteScrollRef.current.scrollTo({ y: minuteIndex * pickerItemHeight, animated: true });
        }
      }, 100);
    }
  }, [showPickupTimePicker]);

  const loadDurations = async () => {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, '/rates/carRental/selfDrive/durations'));
      
      if (snapshot.exists()) {
        const durationsData = snapshot.val();
        const durationsList = Object.keys(durationsData).map(key => ({
          id: key,
          ...durationsData[key]
        })).filter(d => d.isActive !== false);
        
        const durationsWithHours = durationsList.map(d => ({
          ...d,
          hours: parseInt(d.id)
        }));
        setAvailableDurations(durationsWithHours);
      }
    } catch (error) {
      console.error('Error loading durations:', error);
    }
  };

  const calculateReturnDate = () => {
    if (!pickupDate || !pickupTime || !selectedDuration) return;
    
    const [month, day, year] = pickupDate.split('-').map(Number);
    const [hour, minute] = pickupTime.split(':').map(Number);
    
    const pickupDateTime = new Date(year, month - 1, day, hour, minute);
    const durationHours = selectedDuration.hours || parseInt(selectedDuration.id);
    const returnDateTime = new Date(pickupDateTime.getTime() + durationHours * 60 * 60 * 1000);
    
    const returnMonth = String(returnDateTime.getMonth() + 1).padStart(2, '0');
    const returnDay = String(returnDateTime.getDate()).padStart(2, '0');
    const returnYear = returnDateTime.getFullYear();
    const returnHour = String(returnDateTime.getHours()).padStart(2, '0');
    const returnMinute = String(returnDateTime.getMinutes()).padStart(2, '0');
    
    const formattedReturnDate = `${returnMonth}-${returnDay}-${returnYear}`;
    const formattedReturnTime = `${returnHour}:${returnMinute}`;
    
    setReturnDate(`${formattedReturnDate} at ${formattedReturnTime}`);
  };

  const loadLocations = async () => {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, '/rates/carRental/selfDrive/locations'));
      
      if (snapshot.exists()) {
        const locationsData = snapshot.val();
        const locationsList = Object.keys(locationsData).map(key => ({
          id: key,
          ...locationsData[key]
        })).filter(l => l.isActive !== false);
        
        console.log('Loaded locations:', locationsList.map(l => ({ id: l.id, name: l.name })));
        setAvailableLocations(locationsList);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadTransportUnits = async () => {
    try {
      setLoading(true);
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, '/transportUnits'));
      
      if (snapshot.exists()) {
        const unitsData = snapshot.val();
        const unitsList = Object.keys(unitsData).map(key => ({
          id: key,
          ...unitsData[key]
        }));
        setTransportUnits(unitsList);
      }
    } catch (error) {
      console.error('Error loading transport units:', error);
      Alert.alert('Error', 'Failed to load available vehicles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlacePredictions = async (query, field) => {
    if (!GEOAPIFY_API_KEY) {
      console.warn('Missing EXPO_PUBLIC_GEOAPIFY_API_KEY for place predictions.');
      return;
    }

    const setLoading = field === 'pickup' ? setPickupPredictionsLoading : setDropoffPredictionsLoading;
    const setPredictions = field === 'pickup' ? setPickupPredictions : setDropoffPredictions;

    try {
      setLoading(true);
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
        setPredictions((results || []).slice(0, 6));
      } else {
        setPredictions([]);
        console.warn('Geoapify autocomplete error:', data.statusCode || response.status, data.message);
      }
    } catch (error) {
      console.error('Error loading place predictions:', error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (prediction, field) => {
    const selectedAddress = prediction.formatted || (prediction.properties && prediction.properties.formatted) || '';
    const matchedLocation = findMatchingLocation(selectedAddress);
    
    if (field === 'pickup') {
      setPickupLocation(selectedAddress);
      setSelectedPickupArea(matchedLocation);
      setPickupLocationError(matchedLocation ? '' : 'Pickup location not in service area');
      setShowPickupSuggestions(false);
    } else {
      setDropoffLocation(selectedAddress);
      setSelectedDropoffArea(matchedLocation);
      setDropoffLocationError(matchedLocation ? '' : 'Dropoff location not in service area');
      setShowDropoffSuggestions(false);
    }
  };

  const renderLocationSuggestions = (field) => {
    const suggestions = field === 'pickup' ? pickupPredictions : dropoffPredictions;
    const isLoading = field === 'pickup' ? pickupPredictionsLoading : dropoffPredictionsLoading;
    const isVisible = field === 'pickup' ? showPickupSuggestions : showDropoffSuggestions;

    if (!isVisible || (!isLoading && suggestions.length === 0)) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <ScrollView
          style={styles.suggestionsScrollView}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {isLoading && (
            <View style={styles.suggestionItem}>
              <ActivityIndicator size="small" color="#ff4d4d" />
              <Text style={styles.suggestionText}>Searching places...</Text>
            </View>
          )}
          {!isLoading && suggestions.map((prediction, index) => (
            <Pressable
              key={prediction?.properties?.place_id || prediction.place_id || `${prediction.formatted || ''}-${index}`}
              style={[
                styles.suggestionItem,
                index === suggestions.length - 1 && styles.suggestionItemLast
              ]}
              onPress={() => handleLocationSelect(prediction, field)}
            >
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.suggestionText}>{prediction.formatted || (prediction.properties && prediction.properties.formatted)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };

  const findMatchingLocation = (address) => {
    if (!address) return null;
    
    const normalizeForMatch = (str) => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '_');
    };
    
    const normalizedAddress = normalizeForMatch(address);
    console.log('Normalized address:', normalizedAddress);
    
    let matched = availableLocations.find(loc => {
      const normalizedId = normalizeForMatch(loc.id);
      return normalizedAddress.includes(normalizedId) || normalizedId.includes(normalizedAddress);
    });
    
    if (matched) {
      console.log(`Matched location by ID: ${matched.id} -> ${matched.name}`);
      return matched;
    }
    
    matched = availableLocations.find(loc => {
      const normalizedName = normalizeForMatch(loc.name);
      return normalizedAddress.includes(normalizedName) || normalizedName.includes(normalizedAddress);
    });
    
    if (matched) {
      console.log(`Matched location by name: ${matched.id} -> ${matched.name}`);
    }
    
    return matched;
  };

  const filterAvailableUnitsWithData = (ratesData, globalDiscount) => {
    if (!selectedPickupArea || !selectedDuration) return;
    
    const pickupId = selectedPickupArea.id;
    const dropoffId = selectedDropoffArea?.id || pickupId;
    const locationKey = `${pickupId}_to_${dropoffId}`;
    const isSameLocation = pickupId === dropoffId;
    
    console.log('🔄 Filtering units with fresh data...');
    console.log('Global discount:', globalDiscount);
    
    const unitsWithPrices = [];
    
    for (const unit of transportUnits) {
      const unitRates = ratesData?.[unit.id];
      if (!unitRates) continue;
      
      let originalPrice = null;
      let discountedPrice = null;
      
      if (!isSameLocation) {
        const differentLocationRates = unitRates?.prices?.different_location?.[locationKey];
        if (differentLocationRates) {
          originalPrice = differentLocationRates[selectedDuration.id];
          discountedPrice = unitRates?.discountedPrices?.different_location?.[locationKey]?.[selectedDuration.id];
        }
      } else {
        const sameLocationRates = unitRates?.prices?.same_location?.[pickupId];
        if (sameLocationRates) {
          originalPrice = sameLocationRates[selectedDuration.id];
          discountedPrice = unitRates?.discountedPrices?.same_location?.[pickupId]?.[selectedDuration.id];
        }
      }
      
      if (originalPrice) {
        const basePrice = parseInt(originalPrice);
        let finalPrice = basePrice;
        let discountInfoObj = null;
        
        if (discountedPrice) {
          finalPrice = parseInt(discountedPrice);
          const discountAmount = basePrice - finalPrice;
          discountInfoObj = {
            type: globalDiscount?.discountType || 'fixed',
            value: globalDiscount?.value || discountAmount,
            originalPrice: basePrice,
            discountedPrice: finalPrice
          };
        }
        
        unitsWithPrices.push({
          ...unit,
          basePrice: basePrice,
          discountedPrice: finalPrice !== basePrice ? finalPrice : null,
          discountInfo: discountInfoObj,
          originalPriceValue: originalPrice
        });
      }
    }
    
    unitsWithPrices.sort((a, b) => {
      const priceA = a.discountedPrice || a.basePrice;
      const priceB = b.discountedPrice || b.basePrice;
      return priceA - priceB;
    });
    
    setFilteredUnits(unitsWithPrices);
  };

  const filterAvailableUnits = async () => {
    if (!selectedPickupArea || !selectedDuration) return;

    try {
      setLoading(true);
      const dbRef = ref(database);
      
      const [ratesSnapshot, globalDiscountSnapshot] = await Promise.all([
        get(child(dbRef, '/rates/carRental/selfDrive/transportUnitRates')),
        get(child(dbRef, '/rates/carRental/selfDrive/globalDiscount'))
      ]);
      
      let globalDiscount = null;
      if (globalDiscountSnapshot.exists()) {
        const discountData = globalDiscountSnapshot.val();
        if (discountData.active === true) {
          globalDiscount = discountData;
          setLatestGlobalDiscount(globalDiscount);
          console.log('Global discount loaded:', globalDiscount);
        }
      }
      
      if (!ratesSnapshot.exists()) {
        console.log('No rates found');
        setFilteredUnits([]);
        return;
      }

      const ratesData = ratesSnapshot.val();
      setLatestRatesData(ratesData);
      filterAvailableUnitsWithData(ratesData, globalDiscount);
      
    } catch (error) {
      console.error('Error filtering units:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryFee = () => {
    if (selectedPickupArea?.deliveryFeeFromPasay) {
      setDeliveryFee(parseInt(selectedPickupArea.deliveryFeeFromPasay));
    } else {
      setDeliveryFee(0);
    }
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    
    if (unit.discountedPrice) {
      setCalculatedPrice(unit.discountedPrice + deliveryFee);
      setOriginalPrice(unit.basePrice);
      setDiscountInfo(unit.discountInfo || {
        type: 'fixed',
        value: unit.basePrice - unit.discountedPrice,
        originalPrice: unit.basePrice,
        discountedPrice: unit.discountedPrice
      });
      console.log(`Unit selected: ${unit.transportUnit}, Original: ${unit.basePrice}, Discounted: ${unit.discountedPrice}`);
    } else {
      setCalculatedPrice(unit.basePrice + deliveryFee);
      setOriginalPrice(unit.basePrice);
      setDiscountInfo(null);
      console.log(`Unit selected: ${unit.transportUnit}, Price: ${unit.basePrice} (no discount)`);
    }
  };

  const handleSearchUnits = async () => {
    let hasError = false;
    
    if (!pickupLocation) {
      setPickupLocationError('Pickup location is required');
      hasError = true;
    }
    if (!selectedPickupArea) {
      setPickupLocationError('Please select a valid pickup location from suggestions');
      hasError = true;
    }
    if (!pickupDate) {
      Alert.alert('Error', 'Please select pickup date');
      hasError = true;
    }
    if (!pickupTime) {
      Alert.alert('Error', 'Please select pickup time');
      hasError = true;
    }
    if (!selectedDuration) {
      Alert.alert('Error', 'Please select rental duration');
      hasError = true;
    }
    
    if (!hasError) {
      calculateDeliveryFee();
      await filterAvailableUnits();
      setShowUnitSelection(true);
    }
  };

  const handlePickThisUnit = () => {
    setShowConfirmBooking(true);
  };

  const handleConfirmBooking = () => {
    const phoneValidation = validatePhoneNumber();
    
    if (!passengerDetails.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    if (!passengerDetails.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!passengerDetails.contactNumber.trim()) {
      Alert.alert('Error', 'Please enter your contact number');
      return;
    }
    if (!passengerDetails.driverLicenseNumber.trim()) {
      Alert.alert('Error', 'Please enter your driver\'s license number');
      return;
    }
    if (!phoneValidation.isValid) return;
    
    const bookingData = {
      serviceType: 'selfdrive',
      pickupLocation,
      dropoffLocation: dropoffLocation || pickupLocation,
      pickupDate,
      pickupTime,
      returnDate,
      selectedDuration,
      selectedUnit: {
        id: selectedUnit.id,
        name: selectedUnit.transportUnit,
        type: selectedUnit.unitType,
        color: selectedUnit.color
      },
      price: {
        original: originalPrice,
        final: calculatedPrice,
        discount: discountInfo,
        deliveryFee
      },
      selectedPickupArea,
      selectedDropoffArea,
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
      if (shouldSetError) setPhoneError(`Enter a valid ${passengerDetails.countryCode} phone number`);
      return { isValid: false, formattedNumber: '' };
    }
    if (shouldSetError) setPhoneError('');
    return { isValid: true, formattedNumber: phoneNumber.number };
  };

  const restoreSavedData = (data) => {
    if (data.pickupLocation) setPickupLocation(data.pickupLocation);
    if (data.dropoffLocation) setDropoffLocation(data.dropoffLocation);
    if (data.pickupDate) setPickupDate(data.pickupDate);
    if (data.pickupTime) setPickupTime(data.pickupTime);
    if (data.selectedDuration) setSelectedDuration(data.selectedDuration);
    if (data.selectedUnit) setSelectedUnit(data.selectedUnit);
    if (data.passengerDetails) {
      setPassengerDetails(prev => ({ 
        ...prev, 
        ...data.passengerDetails,
        // Ensure driverLicenseNumber is preserved
        driverLicenseNumber: data.passengerDetails.driverLicenseNumber || prev.driverLicenseNumber
      }));
    }
    if (data.price) {
      if (data.price.original) setOriginalPrice(data.price.original);
      if (data.price.final) setCalculatedPrice(data.price.final);
      if (data.price.discount) setDiscountInfo(data.price.discount);
    }
    if (data.selectedPickupArea) setSelectedPickupArea(data.selectedPickupArea);
    if (data.selectedDropoffArea) setSelectedDropoffArea(data.selectedDropoffArea);
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

  const getUnitTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'van': return 'van-passenger';
      case 'suv': return 'car-sport';
      case 'sedan': return 'car';
      default: return 'car';
    }
  };

  // Generate data for pickers
  const months = Array.from({ length: 12 }, (_, i) => ({ label: (i + 1).toString().padStart(2, '0'), value: i + 1 }));
  const years = Array.from({ length: 6 }, (_, i) => ({ label: (new Date().getFullYear() + i).toString(), value: new Date().getFullYear() + i }));
  const hours = Array.from({ length: 24 }, (_, i) => ({ label: i.toString().padStart(2, '0'), value: i }));
  const minutes = Array.from({ length: 60 }, (_, i) => ({ label: i.toString().padStart(2, '0'), value: i }));

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const pickupDays = Array.from({ length: getDaysInMonth(tempPickupMonth, tempPickupYear) }, (_, i) => ({ 
    label: (i + 1).toString().padStart(2, '0'), 
    value: i + 1 
  }));

  const handleConfirmPickupDate = () => {
    const newDate = formatDate(tempPickupMonth, tempPickupDay, tempPickupYear);
    setPickupDate(newDate);
    setShowPickupDatePicker(false);
  };

  const handleConfirmPickupTime = () => {
    const newTime = formatTime(tempPickupHour, tempPickupMinute);
    setPickupTime(newTime);
    setShowPickupTimePicker(false);
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

  // Render Itinerary Section
  const renderItinerarySection = () => (
    <View style={[styles.section, { overflow: 'visible', zIndex: 999 }]}>
      <Text style={styles.sectionTitle}>Trip Details</Text>
      
      <Text style={styles.label}>Pickup Location *</Text>
      <View style={[styles.autocompleteWrapper, { zIndex: 9999, overflow: 'visible' }]}>
        <TextInput 
          style={[styles.input, pickupLocationError && styles.inputError]}
          placeholder="Enter pickup location"
          placeholderTextColor="#999"
          value={pickupLocation}
          onChangeText={setPickupLocation}
          onFocus={() => setShowPickupSuggestions(true)}
        />
        {pickupLocationError ? <Text style={styles.errorText}>{pickupLocationError}</Text> : null}
        {showPickupSuggestions && renderLocationSuggestions('pickup')}
      </View>
      
      <Text style={styles.label}>Dropoff Location (Optional)</Text>
      <View style={[styles.autocompleteWrapper, { zIndex: 9998, overflow: 'visible' }]}>
        <TextInput 
          style={[styles.input, dropoffLocationError && styles.inputError]}
          placeholder="Leave empty if same as pickup"
          placeholderTextColor="#999"
          value={dropoffLocation}
          onChangeText={setDropoffLocation}
          onFocus={() => setShowDropoffSuggestions(true)}
        />
        {dropoffLocationError ? <Text style={styles.errorText}>{dropoffLocationError}</Text> : null}
        {showDropoffSuggestions && renderLocationSuggestions('dropoff')}
      </View>
      
      <Text style={styles.label}>Pickup Date *</Text>
      <Pressable style={styles.pickerButton} onPress={() => setShowPickupDatePicker(true)}>
        <Text style={pickupDate ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
          {pickupDate || "Select Pickup Date"}
        </Text>
      </Pressable>
      
      <Text style={styles.label}>Pickup Time (Philippine Time UTC+8) *</Text>
      <Pressable style={styles.pickerButton} onPress={() => setShowPickupTimePicker(true)}>
        <Text style={pickupTime ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
          {pickupTime || "Select Pickup Time"}
        </Text>
      </Pressable>
      
      <Text style={styles.label}>Rental Duration *</Text>
      <View style={styles.durationGroup}>
        {availableDurations.map((duration) => (
          <Pressable
            key={duration.id}
            style={[styles.durationOption, selectedDuration?.id === duration.id && styles.durationSelected]}
            onPress={() => setSelectedDuration(duration)}
          >
            <Text style={[styles.durationLabel, selectedDuration?.id === duration.id && styles.durationLabelSelected]}>
              {duration.name}
            </Text>
          </Pressable>
        ))}
      </View>
      
      {returnDate ? (
        <View style={styles.readOnlyField}>
          <Text style={styles.label}>Return Date & Time (Auto-calculated)</Text>
          <Text style={styles.readOnlyText}>{returnDate}</Text>
        </View>
      ) : null}
      
      <Pressable style={styles.searchButton} onPress={handleSearchUnits}>
        <Text style={styles.searchButtonText}>Search Units for this Trip</Text>
      </Pressable>
    </View>
  );

  // Render Unit Selection Section
  const renderUnitSelectionSection = () => (
    <View style={{ flex: 1 }}>
      <Pressable onPress={() => setShowUnitSelection(false)} style={styles.backToItinerary}>
        <Ionicons name="arrow-back" size={20} color="#ff4d4d" />
        <Text style={styles.backToItineraryText}>Back to Itinerary</Text>
      </Pressable>
      
      <Text style={styles.sectionTitle}>Available Vehicles</Text>
      <Text style={styles.sectionSubtitle}>
        {selectedDuration?.name} rental • {selectedPickupArea?.name || 'Selected area'}
        {deliveryFee > 0 && ` • Delivery Fee: ${formatPrice(deliveryFee)}`}
      </Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4d4d" />
          <Text style={styles.loadingText}>Loading vehicles...</Text>
        </View>
      ) : filteredUnits.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No vehicles available for this trip</Text>
        </View>
      ) : (
        filteredUnits.map((unit) => {
          const isSelected = selectedUnit?.id === unit.id;
          const displayPrice = unit.discountedPrice || unit.basePrice;
          const totalPrice = displayPrice + deliveryFee;
          
          return (
            <Pressable
              key={unit.id}
              style={[styles.unitCard, isSelected && styles.unitCardSelected]}
              onPress={() => handleUnitSelect(unit)}
            >
              <View style={styles.unitHeader}>
                <View style={styles.unitIcon}>
                  <Ionicons name={getUnitTypeIcon(unit.unitType)} size={40} color="#ff4d4d" />
                </View>
                <View style={styles.unitInfo}>
                  <Text style={styles.unitName}>{unit.transportUnit}</Text>
                  <Text style={styles.unitType}>{unit.unitType}</Text>
                  {unit.color && <Text style={styles.unitColor}>Color: {unit.color}</Text>}
                </View>
                {unit.discountedPrice ? (
                  <View style={styles.unitPrice}>
                    <Text style={styles.originalPrice}>{formatPrice(unit.basePrice)}</Text>
                    <Text style={styles.discountedPrice}>{formatPrice(unit.discountedPrice)}</Text>
                    <Text style={styles.perDay}>+ delivery fee</Text>
                  </View>
                ) : (
                  <View style={styles.unitPrice}>
                    <Text style={styles.priceAmount}>{formatPrice(unit.basePrice)}</Text>
                    <Text style={styles.perDay}>+ delivery fee</Text>
                  </View>
                )}
              </View>
              
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                  <Text style={styles.selectedBadgeText}>Selected</Text>
                </View>
              )}
            </Pressable>
          );
        })
      )}
      
      {selectedUnit && (
        <View style={styles.floatingButtonContainer}>
          <Pressable style={styles.pickUnitButton} onPress={handlePickThisUnit}>
            <Text style={styles.pickUnitButtonText}>Pick this Unit</Text>
            <Text style={styles.pickUnitPrice}>{formatPrice(calculatedPrice)} total</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  // Render Confirm Booking Section
  const renderConfirmBookingSection = () => (
    <View>
      <Pressable onPress={() => setShowConfirmBooking(false)} style={styles.backToItinerary}>
        <Ionicons name="arrow-back" size={20} color="#ff4d4d" />
        <Text style={styles.backToItineraryText}>Back to Vehicles</Text>
      </Pressable>
      
      <Text style={styles.sectionTitle}>Confirm Booking</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Trip Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Vehicle:</Text>
          <Text style={styles.summaryValue}>{selectedUnit?.transportUnit} ({selectedUnit?.unitType})</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pickup:</Text>
          <Text style={styles.summaryValue}>{pickupLocation}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Dropoff:</Text>
          <Text style={styles.summaryValue}>{dropoffLocation || pickupLocation}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>{selectedDuration?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pickup:</Text>
          <Text style={styles.summaryValue}>{pickupDate} at {pickupTime}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Return:</Text>
          <Text style={styles.summaryValue}>{returnDate}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Base Price:</Text>
          <Text style={styles.summaryValue}>{formatPrice(originalPrice)}</Text>
        </View>
        {deliveryFee > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
            <Text style={styles.summaryValue}>{formatPrice(deliveryFee)}</Text>
          </View>
        )}
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
        <Text style={styles.sectionTitle}>Driver Details</Text>
        
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
        
        <Text style={styles.label}>Contact Number *</Text>
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
            placeholder="Enter your contact number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={passengerDetails.contactNumber}
            onChangeText={(text) => setPassengerDetails({...passengerDetails, contactNumber: text.replace(/\D/g, '')})}
            onBlur={() => validatePhoneNumber()}
          />
        </View>
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
        
        <Text style={styles.label}>Driver's License Number *</Text>
        <TextInput 
          style={styles.input}
          placeholder="Enter your driver's license number"
          placeholderTextColor="#999"
          value={passengerDetails.driverLicenseNumber}
          onChangeText={(text) => setPassengerDetails({...passengerDetails, driverLicenseNumber: text})}
        />
        
        <Text style={styles.label}>Special Requests (Optional)</Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder="Any special requests? (e.g., child seat, GPS, etc.)"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          value={passengerDetails.specialRequests}
          onChangeText={(text) => setPassengerDetails({...passengerDetails, specialRequests: text})}
        />
      </View>
      
      <Pressable style={styles.confirmButton} onPress={handleConfirmBooking}>
        <Text style={styles.confirmButtonText}>Confirm Booking</Text>
      </Pressable>
    </View>
  );

  if (loading && transportUnits.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d4d" />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
      </View>
    );
  }

  return (
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
      ) : showUnitSelection ? (
        renderUnitSelectionSection()
      ) : (
        renderItinerarySection()
      )}
      
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Cancel</Text>
      </Pressable>
      
      {/* Pickup Date Picker Modal */}
      <Modal
        visible={showPickupDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPickupDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Pickup Date</Text>
            
            <View style={styles.pickerContainer}>
              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabelText}>Month</Text>
                <ScrollView 
                  ref={pickupMonthScrollRef}
                  style={styles.numberPicker}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={pickerItemHeight}
                  decelerationRate="fast"
                >
                  {months.map((month) => renderPickerItem(month, tempPickupMonth, setTempPickupMonth))}
                </ScrollView>
              </View>

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabelText}>Day</Text>
                <ScrollView 
                  ref={pickupDayScrollRef}
                  style={styles.numberPicker}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={pickerItemHeight}
                  decelerationRate="fast"
                >
                  {pickupDays.map((day) => renderPickerItem(day, tempPickupDay, setTempPickupDay))}
                </ScrollView>
              </View>

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabelText}>Year</Text>
                <ScrollView 
                  ref={pickupYearScrollRef}
                  style={styles.numberPicker}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={pickerItemHeight}
                  decelerationRate="fast"
                >
                  {years.map((year) => renderPickerItem(year, tempPickupYear, setTempPickupYear))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButtonCancel} onPress={() => setShowPickupDatePicker(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalButtonConfirm} onPress={handleConfirmPickupDate}>
                <Text style={styles.modalButtonTextConfirm}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Pickup Time Picker Modal */}
      <Modal
        visible={showPickupTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPickupTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Pickup Time (Philippine Time UTC+8)</Text>
            
            <View style={styles.pickerContainer}>
              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabelText}>Hour</Text>
                <ScrollView 
                  ref={pickupHourScrollRef}
                  style={styles.numberPicker}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={pickerItemHeight}
                  decelerationRate="fast"
                >
                  {hours.map((hour) => renderPickerItem(hour, tempPickupHour, setTempPickupHour))}
                </ScrollView>
              </View>

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabelText}>Minute</Text>
                <ScrollView 
                  ref={pickupMinuteScrollRef}
                  style={styles.numberPicker}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={pickerItemHeight}
                  decelerationRate="fast"
                >
                  {minutes.map((minute) => renderPickerItem(minute, tempPickupMinute, setTempPickupMinute))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Pressable style={styles.modalButtonCancel} onPress={() => setShowPickupTimePicker(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalButtonConfirm} onPress={handleConfirmPickupTime}>
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
  );
}