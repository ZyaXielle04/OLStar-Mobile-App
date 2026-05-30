// components/booking/AirportTransferForm1.js
import { View, Text, TextInput, Pressable, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { styles } from '../../styles/AirportTransferForm.styles';
import { database } from '../../firebaseConfig';
import { ref, get, child } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Constants from 'expo-constants';
import countryCodes from './countryCodes';
import countryCodesWithFlags from './countryCodes';

const GEOAPIFY_API_KEY = Constants?.manifest?.extra?.EXPO_PUBLIC_GEOAPIFY_API_KEY ||
  Constants?.expoConfig?.extra?.EXPO_PUBLIC_GEOAPIFY_API_KEY ||
  process.env?.EXPO_PUBLIC_GEOAPIFY_API_KEY;

export default function AirportTransferForm1({ onBack, onBookNow, initialData }) {
  const fallbackAreas = [
    { id: 'makati', name: 'Makati', prices: { 'Economy 4': '4200', 'Premium 6': '5500', 'Luxury 10': '7500' } },
    { id: 'bgc', name: 'BGC', prices: { 'Economy 4': '4500', 'Premium 6': '5800', 'Luxury 10': '7800' } },
    { id: 'las_pinas', name: 'Las PiÃ±as', prices: { 'Economy 4': '4000', 'Premium 6': '5300', 'Luxury 10': '7300' } },
    { id: 'quezon_city', name: 'Quezon City', prices: { 'Economy 4': '4800', 'Premium 6': '6100', 'Luxury 10': '8100' } }
  ];

  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [originalPrice, setOriginalPrice] = useState(null);
  const [discountInfo, setDiscountInfo] = useState(null);
  
  const [tripType, setTripType] = useState('arrival');
  const [selectedAirport, setSelectedAirport] = useState('NAIA');
  const [selectedTerminal, setSelectedTerminal] = useState('Terminal 1');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [pickupPredictions, setPickupPredictions] = useState([]);
  const [dropoffPredictions, setDropoffPredictions] = useState([]);
  const [pickupPredictionsLoading, setPickupPredictionsLoading] = useState(false);
  const [dropoffPredictionsLoading, setDropoffPredictionsLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [areaError, setAreaError] = useState('');
  const [availableAreas, setAvailableAreas] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isItineraryComplete, setIsItineraryComplete] = useState(false);
  const [isPackageExpanded, setIsPackageExpanded] = useState(false);
  const [isPassengerExpanded, setIsPassengerExpanded] = useState(false);
  
  // Date Picker Modal States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempMonth, setTempMonth] = useState(new Date().getMonth() + 1);
  const [tempDay, setTempDay] = useState(new Date().getDate());
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  
  // Time Picker Modal States
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempHour, setTempHour] = useState(14);
  const [tempMinute, setTempMinute] = useState(0);
  
  // Validation errors
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [showCountryCodePicker, setShowCountryCodePicker] = useState(false);
  const [countryCodeSearch, setCountryCodeSearch] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Refs for scroll views
  const monthScrollRef = useRef(null);
  const dayScrollRef = useRef(null);
  const yearScrollRef = useRef(null);
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  
  // State for picker item height
  const [pickerItemHeight, setPickerItemHeight] = useState(45);

  // Passenger details state
  const [passengerDetails, setPassengerDetails] = useState({
    fullName: '',
    countryIsoCode: 'PH',
    countryCode: '+63',
    contactNumber: '',
    email: '',
    numPassengers: '',
    numLuggage: '',
    specialRequests: ''
  });

  // Restore saved data when component mounts
  useEffect(() => {
    if (initialData) {
      console.log('Restoring saved form data:', initialData);
      
      if (initialData.tripType) setTripType(initialData.tripType);
      if (initialData.selectedAirport) setSelectedAirport(initialData.selectedAirport);
      if (initialData.selectedTerminal) setSelectedTerminal(initialData.selectedTerminal);
      if (initialData.pickupLocation) setPickupLocation(initialData.pickupLocation);
      if (initialData.dropoffLocation) setDropoffLocation(initialData.dropoffLocation);
      if (initialData.date) setDate(initialData.date);
      if (initialData.time) setTime(initialData.time);
      if (initialData.selectedArea) setSelectedArea(initialData.selectedArea);
      
      if (initialData.passengerDetails) {
        setPassengerDetails(prev => ({
          ...prev,
          ...initialData.passengerDetails
        }));
      }
      
      if (initialData.selectedPackage) setSelectedPackage(initialData.selectedPackage);
      
      if (initialData.price) {
        if (initialData.price.original) setOriginalPrice(initialData.price.original);
        if (initialData.price.final) setCalculatedPrice(initialData.price.final);
        if (initialData.price.discount) setDiscountInfo(initialData.price.discount);
      }
      
      setTimeout(() => {
        const pickup = initialData.pickupLocation || pickupLocation;
        const dropoff = initialData.dropoffLocation || dropoffLocation;
        const dateVal = initialData.date || date;
        const timeVal = initialData.time || time;
        checkItineraryComplete(pickup, dropoff, dateVal, timeVal);
        
        if (initialData.selectedPackage) setIsPackageExpanded(true);
        if (initialData.passengerDetails?.fullName) setIsPassengerExpanded(true);
      }, 100);
    }
  }, [initialData]);

  // Load packages from Firebase
  useEffect(() => {
    loadPackages();
    loadAreas();
  }, []);

  useEffect(() => {
    if (tripType !== 'departure') return;

    const query = pickupLocation.trim();
    if (query.length < 3) {
      setPickupPredictions([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetchPlacePredictions(query, 'pickup');
    }, 350);

    return () => clearTimeout(timeout);
  }, [pickupLocation, tripType]);

  useEffect(() => {
    if (tripType !== 'arrival') return;

    const query = dropoffLocation.trim();
    if (query.length < 3) {
      setDropoffPredictions([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetchPlacePredictions(query, 'dropoff');
    }, 350);

    return () => clearTimeout(timeout);
  }, [dropoffLocation, tripType]);

  // Auto-scroll to selected values when date picker opens
  useEffect(() => {
    if (showDatePicker) {
      setTimeout(() => {
        const monthIndex = months.findIndex(m => m.value === tempMonth);
        if (monthScrollRef.current && monthIndex !== -1) {
          monthScrollRef.current.scrollTo({
            y: monthIndex * pickerItemHeight,
            animated: true,
          });
        }
        
        const dayIndex = days.findIndex(d => d.value === tempDay);
        if (dayScrollRef.current && dayIndex !== -1) {
          dayScrollRef.current.scrollTo({
            y: dayIndex * pickerItemHeight,
            animated: true,
          });
        }
        
        const yearIndex = years.findIndex(y => y.value === tempYear);
        if (yearScrollRef.current && yearIndex !== -1) {
          yearScrollRef.current.scrollTo({
            y: yearIndex * pickerItemHeight,
            animated: true,
          });
        }
      }, 100);
    }
  }, [showDatePicker, tempMonth, tempDay, tempYear]);

  // Auto-scroll to selected values when time picker opens
  useEffect(() => {
    if (showTimePicker) {
      setTimeout(() => {
        const hourIndex = hours.findIndex(h => h.value === tempHour);
        if (hourScrollRef.current && hourIndex !== -1) {
          hourScrollRef.current.scrollTo({
            y: hourIndex * pickerItemHeight,
            animated: true,
          });
        }
        
        const minuteIndex = minutes.findIndex(m => m.value === tempMinute);
        if (minuteScrollRef.current && minuteIndex !== -1) {
          minuteScrollRef.current.scrollTo({
            y: minuteIndex * pickerItemHeight,
            animated: true,
          });
        }
      }, 100);
    }
  }, [showTimePicker, tempHour, tempMinute]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, '/packages'));
      
      if (snapshot.exists()) {
        const packagesData = snapshot.val();
        const packagesList = Object.keys(packagesData).map(key => ({
          id: key,
          ...packagesData[key]
        }));
        setPackages(packagesList);
        console.log('Packages loaded:', packagesList);
      } else {
        console.log('No packages found');
        setPackages([
          {
            id: 'economy_4',
            packageName: 'Economy 4',
            maxPax: 4,
            maxLuggage: 3,
            vehicleTypes: ['Sedan']
          },
          {
            id: 'premium_6',
            packageName: 'Premium 6',
            maxPax: 6,
            maxLuggage: 4,
            vehicleTypes: ['SUV', 'Van']
          },
          {
            id: 'luxury_10',
            packageName: 'Luxury 10',
            maxPax: 10,
            maxLuggage: 6,
            vehicleTypes: ['Van']
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
      Alert.alert('Error', 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async () => {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, '/rates/airportTransfer'));
      
      if (snapshot.exists()) {
        const ratesData = snapshot.val();
        const areas = [];
        Object.keys(ratesData).forEach(location => {
          if (ratesData[location].areas) {
            Object.keys(ratesData[location].areas).forEach(areaKey => {
              areas.push({
                key: `${location}:${areaKey}`,
                id: areaKey,
                name: ratesData[location].areas[areaKey].name || areaKey,
                location: location,
                prices: ratesData[location].areas[areaKey].prices,
                discountedPrices: ratesData[location].areas[areaKey].discountedPrices
              });
            });
          }
        });
        setAvailableAreas(areas);
        console.log('Areas loaded:', areas);
      } else {
        console.log('No areas found');
        setAvailableAreas([
          { id: 'makati', name: 'Makati', prices: { 'Economy 4': '4200', 'Premium 6': '5500', 'Luxury 10': '7500' } },
          { id: 'bgc', name: 'BGC', prices: { 'Economy 4': '4500', 'Premium 6': '5800', 'Luxury 10': '7800' } },
          { id: 'las_pinas', name: 'Las Piñas', prices: { 'Economy 4': '4000', 'Premium 6': '5300', 'Luxury 10': '7300' } },
          { id: 'quezon_city', name: 'Quezon City', prices: { 'Economy 4': '4800', 'Premium 6': '6100', 'Luxury 10': '8100' } }
        ]);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
      setAvailableAreas(fallbackAreas);
    }
  };

  useEffect(() => {
    if (selectedPackage && selectedArea) {
      calculatePrice();
    }
  }, [selectedPackage, selectedArea, availableAreas]);

  useEffect(() => {
    checkItineraryComplete(pickupLocation, dropoffLocation, date, time);
  }, [passengerDetails.numPassengers, passengerDetails.numLuggage]);

  const calculatePrice = () => {
    const area = availableAreas.find(a => a.key === selectedArea || a.id === selectedArea);
    if (!area || !selectedPackage) return;

    const packageName = selectedPackage.packageName;
    const priceRaw = area.prices?.[packageName];
    const priceNum = Number(priceRaw);

    if (!Number.isFinite(priceNum)) {
      setCalculatedPrice(null);
      setOriginalPrice(null);
      setDiscountInfo(null);
      return;
    }

    setOriginalPrice(String(priceNum));

    if (area.discountedPrices) {
      const discount = area.discountedPrices;
      const discountValue = Number(discount.value);
      let finalPrice = priceNum;

      if (discount.discountType === 'fixed' && Number.isFinite(discountValue)) {
        finalPrice = finalPrice - discountValue;
      } else if (discount.discountType === 'percentage' && Number.isFinite(discountValue)) {
        finalPrice = finalPrice * (1 - discountValue / 100);
      }

      const rounded = Math.round(finalPrice);
      setCalculatedPrice(String(rounded));
      setDiscountInfo({
        type: discount.discountType,
        value: discount.value,
        originalPrice: String(priceNum),
        discountedPrice: String(rounded)
      });
    } else {
      setCalculatedPrice(String(priceNum));
      setDiscountInfo(null);
    }
  };

  const airports = {
    NAIA: {
      name: 'Ninoy Aquino International Airport (NAIA)',
      terminals: ['Terminal 1', 'Terminal 2', 'Terminal 3']
    },
    CRK: {
      name: 'Clark International Airport',
      terminals: ['Main Terminal']
    }
  };

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

  const openDatePicker = () => {
    if (date) {
      const [month, day, year] = date.split('-').map(Number);
      setTempMonth(month);
      setTempDay(day);
      setTempYear(year);
    } else {
      const now = new Date();
      setTempMonth(now.getMonth() + 1);
      setTempDay(now.getDate());
      setTempYear(now.getFullYear());
    }
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    if (time) {
      const [hour, minute] = time.split(':').map(Number);
      setTempHour(hour);
      setTempMinute(minute);
    } else {
      setTempHour(14);
      setTempMinute(0);
    }
    setShowTimePicker(true);
  };

  const validateDate = (dateStr) => {
    const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-(\d{4})$/;
    if (!dateRegex.test(dateStr)) {
      setDateError('Invalid format. Use MM-DD-YYYY');
      return false;
    }
    
    const [month, day, year] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    if (dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
      setDateError('Invalid date');
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      setDateError('Date cannot be in the past');
      return false;
    }
    
    setDateError('');
    return true;
  };

  const validateTime = (timeStr) => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(timeStr)) {
      setTimeError('Invalid format. Use HH:MM (24-hour)');
      return false;
    }
    
    const [hours] = timeStr.split(':').map(Number);
    
    if (hours < 0 || hours > 23) {
      setTimeError('Hours must be between 00 and 23');
      return false;
    }
    
    setTimeError('');
    return true;
  };

  const arePassengerDetailsComplete = () => {
    return passengerDetails.fullName.trim() !== '' &&
           passengerDetails.contactNumber.trim() !== '' &&
           passengerDetails.email.trim() !== '' &&
           validatePhoneNumber(false).isValid;
  };

  const areTripCapacityDetailsComplete = () => {
    return passengerDetails.numPassengers.trim() !== '' &&
           passengerDetails.numLuggage.trim() !== '';
  };

  const isPackageSelected = () => {
    return selectedPackage !== null;
  };

  const isFormComplete = () => {
    return isItineraryComplete && areTripCapacityDetailsComplete() && isPackageSelected() && calculatedPrice && arePassengerDetailsComplete();
  };

  const checkItineraryComplete = (pickup, dropoff, dateVal, timeVal) => {
    let locationComplete = false;
    
    if (tripType === 'arrival') {
      locationComplete = dropoff.trim() !== '';
    } else {
      locationComplete = pickup.trim() !== '';
    }
    
    const isDateValid = dateVal.trim() !== '' && validateDate(dateVal);
    const isTimeValid = timeVal.trim() !== '' && validateTime(timeVal);
    const capacityComplete = areTripCapacityDetailsComplete();
    const isComplete = locationComplete && isDateValid && isTimeValid && capacityComplete;
    
    setIsItineraryComplete(isComplete);
    if (isComplete && !isPackageExpanded) {
      setIsPackageExpanded(true);
    }
  };

  const handleTripTypeChange = (type) => {
    if (tripType === type) return;
    setTripType(type);
    setPickupPredictions([]);
    setDropoffPredictions([]);
    setShowPickupSuggestions(false);
    setShowDropoffSuggestions(false);
    checkItineraryComplete(pickupLocation, dropoffLocation, date, time);
  };

  const handleAirportChange = (airport) => {
    setSelectedAirport(airport);
    if (airport === 'CRK') {
      setSelectedTerminal('Main Terminal');
    } else {
      setSelectedTerminal('Terminal 1');
    }
    checkItineraryComplete(pickupLocation, dropoffLocation, date, time);
  };

  const handleTerminalChange = (terminal) => {
    setSelectedTerminal(terminal);
    checkItineraryComplete(pickupLocation, dropoffLocation, date, time);
  };

  const handlePickupChange = (text) => {
    const matchedArea = findAreaFromAddress(text);
    setPickupLocation(text);
    updateMatchedArea(matchedArea);
    setAreaError('');
    setShowPickupSuggestions(text.trim().length > 0);
    checkItineraryComplete(text, dropoffLocation, date, time);
  };

  const handleDropoffChange = (text) => {
    const matchedArea = findAreaFromAddress(text);
    setDropoffLocation(text);
    updateMatchedArea(matchedArea);
    setAreaError('');
    setShowDropoffSuggestions(text.trim().length > 0);
    checkItineraryComplete(pickupLocation, text, date, time);
  };

  const updateMatchedArea = (matchedArea) => {
    const nextSelectedArea = matchedArea?.key || matchedArea?.id || '';
    if (nextSelectedArea !== selectedArea) {
      setSelectedPackage(null);
      setCalculatedPrice(null);
      setOriginalPrice(null);
      setDiscountInfo(null);
      setPassengerDetails({
        ...passengerDetails,
        numPassengers: '',
        numLuggage: ''
      });
    }
    setSelectedArea(nextSelectedArea);
  };

  const normalizeText = (value) => {
    return value
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/_/g, ' ')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalizeAreaName = (value) => {
    return normalizeText(value)
      .replace(/\bmetro manila\b/g, '')
      .replace(/\bmetropolitan manila\b/g, '')
      .replace(/\bnational capital region\b/g, '')
      .replace(/\bncr\b/g, '')
      .replace(/\bcity of\b/g, '')
      .replace(/\bcity\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const isBroadMetroManilaArea = (value) => {
    const normalizedValue = normalizeText(value);
    return [
      'metro manila',
      'metropolitan manila',
      'national capital region',
      'ncr'
    ].includes(normalizedValue);
  };

  const textHasArea = (text, area) => {
    if (!area) return false;
    const normalizedText = ` ${normalizeAreaName(text)} `;
    const normalizedArea = normalizeAreaName(area);
    return normalizedArea.length > 1 && normalizedText.includes(` ${normalizedArea} `);
  };

  const stripBroadRegionText = (value) => {
    return normalizeText(value)
      .replace(/\bmetro manila\b/g, '')
      .replace(/\bmetropolitan manila\b/g, '')
      .replace(/\bnational capital region\b/g, '')
      .replace(/\bncr\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const findAreaFromAddress = (address, options = {}) => {
    const normalizedAddress = normalizeAreaName(address);
    return availableAreas.find((area) => {
      const areaName = normalizeAreaName(area.name || '');
      const areaId = normalizeAreaName(area.id || '');
      return Boolean(
        textHasArea(normalizedAddress, areaName) ||
        textHasArea(normalizedAddress, areaId) ||
        (options.allowLocationMatch && textHasArea(normalizedAddress, area.location))
      );
    });
  };

  const getGeoapifyAreaCandidates = (place) => {
    const properties = (place && (place.properties || place)) || {};
    const primaryCandidates = [
      properties.city,
      properties.municipality
    ].filter((candidate) => candidate && !isBroadMetroManilaArea(candidate));

    const secondaryCandidates = [
      properties.county,
      properties.state_district
    ].filter((candidate) => candidate && !isBroadMetroManilaArea(candidate));

    return {
      primaryCandidates,
      secondaryCandidates,
      formattedCandidate: stripBroadRegionText(properties.formatted || '')
    };
  };

  const findAreaFromPlace = (place) => {
    const { primaryCandidates, secondaryCandidates, formattedCandidate } = getGeoapifyAreaCandidates(place);

    for (const candidate of primaryCandidates) {
      const matchedArea = findAreaFromAddress(candidate);
      if (matchedArea) return matchedArea;
    }

    if (primaryCandidates.length > 0) {
      return null;
    }

    for (const candidate of secondaryCandidates) {
      const matchedArea = findAreaFromAddress(candidate);
      if (matchedArea) return matchedArea;
    }

    return formattedCandidate ? findAreaFromAddress(formattedCandidate) : null;
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

  const handleLocationSuggestionSelect = (prediction, field) => {
    const selectedAddress = prediction.formatted || (prediction.properties && prediction.properties.formatted) || '';
    const matchedArea = findAreaFromPlace(prediction);

    updateMatchedArea(matchedArea);
    setAreaError(matchedArea ? '' : 'Sorry, this destination is outside the available airport transfer areas.');

    if (field === 'pickup') {
      setPickupLocation(selectedAddress);
      setPickupPredictions([]);
      setShowPickupSuggestions(false);
      checkItineraryComplete(selectedAddress, dropoffLocation, date, time);
    } else {
      setDropoffLocation(selectedAddress);
      setDropoffPredictions([]);
      setShowDropoffSuggestions(false);
      checkItineraryComplete(pickupLocation, selectedAddress, date, time);
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
              onPress={() => handleLocationSuggestionSelect(prediction, field)}
            >
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.suggestionText}>{prediction.formatted || (prediction.properties && prediction.properties.formatted)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };

  const confirmDateSelection = () => {
    const newDate = formatDate(tempMonth, tempDay, tempYear);
    setDate(newDate);
    validateDate(newDate);
    setShowDatePicker(false);
    checkItineraryComplete(pickupLocation, dropoffLocation, newDate, time);
  };

  const confirmTimeSelection = () => {
    const newTime = formatTime(tempHour, tempMinute);
    setTime(newTime);
    validateTime(newTime);
    setShowTimePicker(false);
    checkItineraryComplete(pickupLocation, dropoffLocation, date, newTime);
  };

  const togglePackageSection = () => {
    if (isItineraryComplete) {
      setIsPackageExpanded(!isPackageExpanded);
    }
  };

  const togglePassengerSection = () => {
    if (isPackageSelected()) {
      setIsPassengerExpanded(!isPassengerExpanded);
    }
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    
    if (pkg && !isPassengerExpanded) {
      setIsPassengerExpanded(true);
    }
  };

  const handlePassengerChange = (field, value) => {
    if (field === 'numPassengers' || field === 'numLuggage') {
      const digitsOnly = value.replace(/\D/g, '');

      setPassengerDetails({
        ...passengerDetails,
        [field]: digitsOnly
      });
      setSelectedPackage(null);
      setCalculatedPrice(null);
      setOriginalPrice(null);
      setDiscountInfo(null);
      return;
    }

    if (field === 'contactNumber') {
      const digitsOnly = value.replace(/\D/g, '');
      setPassengerDetails({
        ...passengerDetails,
        contactNumber: digitsOnly
      });
      setPhoneError('');
      return;
    }

    setPassengerDetails({
      ...passengerDetails,
      [field]: value
    });
  };

  const handleCountryCodeSelect = (country) => {
    setPassengerDetails({
      ...passengerDetails,
      countryIsoCode: country.code,
      countryCode: country.dialCode
    });
    setPhoneError('');
    setShowCountryCodePicker(false);
    setCountryCodeSearch('');
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
        setPhoneError(`Enter a valid ${passengerDetails.countryCode} phone number`);
      }
      return { isValid: false, formattedNumber: '' };
    }

    if (shouldSetError) setPhoneError('');
    return {
      isValid: true,
      formattedNumber: phoneNumber.number
    };
  };

  const filteredCountryCodes = countryCodes.filter((country) => {
    const query = countryCodeSearch.trim().toLowerCase();
    if (!query) return true;

    return (
      country.name.toLowerCase().includes(query) ||
      country.code.toLowerCase().includes(query) ||
      country.dialCode.includes(query)
    );
  });

  const selectedCountry = countryCodes.find(c => c.code === passengerDetails.countryIsoCode);

  const getFilteredPackages = () => {
    const requestedPassengers = parseInt(passengerDetails.numPassengers, 10);
    const requestedLuggage = parseInt(passengerDetails.numLuggage, 10);

    if (!requestedPassengers || !requestedLuggage) return [];

    return packages
      .filter((pkg) => {
        return requestedPassengers <= Number(pkg.maxPax || 0) &&
               requestedLuggage <= Number(pkg.maxLuggage || 0);
      })
      .sort((a, b) => {
        const parsePackageName = (pkg) => {
          const name = pkg.packageName || '';
          const letterPart = name.replace(/\d+/g, '').trim().toLowerCase();
          const numberMatch = name.match(/\d+/);
          const numberPart = numberMatch ? parseInt(numberMatch[0], 10) : Number.MAX_SAFE_INTEGER;
          return { letterPart, numberPart };
        };

        const packageA = parsePackageName(a);
        const packageB = parsePackageName(b);
        const letterComparison = packageA.letterPart.localeCompare(packageB.letterPart);

        if (letterComparison !== 0) return letterComparison;
        return packageA.numberPart - packageB.numberPart;
      });
  };

  const filteredPackages = getFilteredPackages();

  const getPackageTag = (packagePrice, allPrices) => {
    if (!allPrices || allPrices.length === 0) return null;
    const numericPrices = allPrices.map(p => Number(p)).filter(Number.isFinite);
    const sortedPrices = [...numericPrices].sort((a, b) => a - b);
    const cheapest = sortedPrices[0];
    const mostExpensive = sortedPrices[sortedPrices.length - 1];
    const middleIndex = Math.floor(sortedPrices.length / 2);
    const middlePrice = sortedPrices[middleIndex];
    
    if (packagePrice === cheapest) {
      return { text: 'Cheapest Deal Picked for You', color: '#4caf50', backgroundColor: '#e8f5e9' };
    } else if (packagePrice === mostExpensive) {
      return { text: 'Grandiose', color: '#ff9800', backgroundColor: '#fff3e0' };
    } else if (packagePrice === middlePrice) {
      return { text: 'Most Valued Deal', color: '#2196f3', backgroundColor: '#e3f2fd' };
    }
    return null;
  };

  const getPickupLabel = () => {
    return tripType === 'arrival' ? 'Pickup Location (Airport)' : 'Pickup Location (Your Location)';
  };

  const getDropoffLabel = () => {
    return tripType === 'arrival' ? 'Dropoff Location (Your Destination)' : 'Dropoff Location (Airport)';
  };

  const getPickupValue = () => {
    if (tripType === 'arrival') {
      const airportName = airports[selectedAirport].name;
      const terminal = selectedTerminal;
      return `${airportName} - ${terminal}`;
    } else {
      return pickupLocation;
    }
  };

  const getDropoffValue = () => {
    if (tripType === 'arrival') {
      return dropoffLocation;
    } else {
      const airportName = airports[selectedAirport].name;
      const terminal = selectedTerminal;
      return `${airportName} - ${terminal}`;
    }
  };

  const handleBookNow = () => {
    const phoneValidation = validatePhoneNumber();

    if (isFormComplete() && phoneValidation.isValid) {
      const bookingData = {
        serviceType: 'airport',
        tripType,
        selectedAirport,
        selectedTerminal,
        pickupLocation: getPickupValue(),
        dropoffLocation: getDropoffValue(),
        date: date,
        time: time,
        selectedPackage: {
          id: selectedPackage.id,
          name: selectedPackage.packageName,
          maxPax: selectedPackage.maxPax,
          maxLuggage: selectedPackage.maxLuggage,
          vehicleTypes: selectedPackage.vehicleTypes
        },
        price: {
          original: originalPrice,
          final: calculatedPrice,
          discount: discountInfo
        },
        selectedArea,
        passengerDetails: {
          ...passengerDetails,
          contactNumber: phoneValidation.formattedNumber
        },
        bookingStatus: 'pending',
        timestamp: new Date().toISOString()
      };
      
      console.log('Booking details:', bookingData);
      onBookNow?.(bookingData);
    }
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d4d" />
        <Text style={styles.loadingText}>Loading packages...</Text>
      </View>
    );
  }

  const allPackagePrices = filteredPackages.map(pkg => {
    const area = availableAreas.find(a => a.key === selectedArea || a.id === selectedArea);
    if (area && area.prices) {
      const price = area.prices[pkg.packageName];
      const pnum = Number(price);
      return Number.isFinite(pnum) ? pnum : null;
    }
    return null;
  }).filter(price => price !== null);

  return (
    <ScrollView 
      style={styles.container}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
    >
      {/* Itinerary Section */}
      <View style={styles.itinerary}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        
        <View style={styles.radioGroup}>
          <Pressable 
            style={[styles.radioOption, tripType === 'arrival' && styles.radioSelected]} 
            onPress={() => handleTripTypeChange('arrival')}
          >
            <View style={[styles.radioCircle, tripType === 'arrival' && styles.radioCircleSelected]} />
            <Text style={styles.radioLabel}>Arrival (Airport to Destination)</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.radioOption, tripType === 'departure' && styles.radioSelected]} 
            onPress={() => handleTripTypeChange('departure')}
          >
            <View style={[styles.radioCircle, tripType === 'departure' && styles.radioCircleSelected]} />
            <Text style={styles.radioLabel}>Departure (Location to Airport)</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Select Airport:</Text>
        <View style={styles.airportGroup}>
          <Pressable 
            style={[styles.airportOption, selectedAirport === 'NAIA' && styles.airportSelected]} 
            onPress={() => handleAirportChange('NAIA')}
          >
            <Text style={styles.airportLabel}>NAIA</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.airportOption, selectedAirport === 'CRK' && styles.airportSelected]} 
            onPress={() => handleAirportChange('CRK')}
          >
            <Text style={styles.airportLabel}>Clark (CRK)</Text>
          </Pressable>
        </View>

        {selectedAirport === 'NAIA' && (
          <View>
            <Text style={styles.label}>Select Terminal:</Text>
            <View style={styles.terminalGroup}>
              {airports.NAIA.terminals.map((terminal) => (
                <Pressable 
                  key={terminal}
                  style={[styles.terminalOption, selectedTerminal === terminal && styles.terminalSelected]} 
                  onPress={() => handleTerminalChange(terminal)}
                >
                  <Text style={[styles.terminalLabel, selectedTerminal === terminal && styles.terminalLabelSelected]}>
                    {terminal}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.label}>{getPickupLabel()}</Text>
        {tripType === 'arrival' ? (
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{getPickupValue()}</Text>
          </View>
        ) : (
          <View style={styles.autocompleteWrapper}>
            <TextInput 
              style={styles.input}
              placeholder="Enter your pickup location"
              placeholderTextColor="#999"
              value={pickupLocation}
              onChangeText={handlePickupChange}
              onFocus={() => setShowPickupSuggestions(pickupLocation.trim().length > 0)}
            />
            {renderLocationSuggestions('pickup')}
          </View>
        )}

        <Text style={styles.label}>{getDropoffLabel()}</Text>
        {tripType === 'departure' ? (
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{getDropoffValue()}</Text>
          </View>
        ) : (
          <View style={styles.autocompleteWrapper}>
            <TextInput 
              style={styles.input}
              placeholder="Enter your destination"
              placeholderTextColor="#999"
              value={dropoffLocation}
              onChangeText={handleDropoffChange}
              onFocus={() => setShowDropoffSuggestions(dropoffLocation.trim().length > 0)}
            />
            {renderLocationSuggestions('dropoff')}
          </View>
        )}
        {areaError ? <Text style={styles.errorText}>{areaError}</Text> : null}

        <Text style={styles.label}>Date (MM-DD-YYYY)</Text>
        <Pressable style={styles.pickerButton} onPress={openDatePicker}>
          <Text style={date ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
            {date || "Select Date"}
          </Text>
        </Pressable>
        {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

        <Text style={styles.label}>Time (HH:MM UTC+8 - 24-hour format)</Text>
        <Pressable style={styles.pickerButton} onPress={openTimePicker}>
          <Text style={time ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
            {time || "Select Time"}
          </Text>
        </Pressable>
        {timeError ? <Text style={styles.errorText}>{timeError}</Text> : null}
        <Text style={styles.hintText}>Example: 14:30 = 2:30 PM Philippine Time</Text>

        <Text style={styles.label}>Number of Passengers *</Text>
        <TextInput 
          style={styles.input}
          placeholder="Enter number of passengers"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={passengerDetails.numPassengers}
          onChangeText={(text) => handlePassengerChange('numPassengers', text)}
        />

        <Text style={styles.label}>Number of Luggages *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number of luggages"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={passengerDetails.numLuggage}
          onChangeText={(text) => handlePassengerChange('numLuggage', text)}
        />
      </View>

      {isItineraryComplete && selectedArea && (
        <>
          <Pressable onPress={togglePackageSection}>
            <View style={styles.packageHeader}>
              <Text style={styles.sectionTitle}>Select Package</Text>
              <Text style={styles.arrow}>
                {isPackageExpanded ? '▲' : '▼'}
              </Text>
            </View>
          </Pressable>

          {isPackageExpanded && (
            <View style={styles.packageContainer}>
              {filteredPackages.length === 0 ? (
                <View style={styles.infoMessage}>
                  <Text style={styles.infoMessageText}>
                    No packages can accommodate the selected passengers and luggages.
                  </Text>
                </View>
              ) : filteredPackages.map((pkg) => {
                const area = availableAreas.find(a => a.key === selectedArea || a.id === selectedArea);
                const packagePrice = area?.prices?.[pkg.packageName] ? parseInt(area.prices[pkg.packageName]) : null;
                const tag = packagePrice ? getPackageTag(packagePrice, allPackagePrices) : null;
                
                return (
                  <Pressable
                    key={pkg.id}
                    style={[
                      styles.packageCard,
                      selectedPackage?.id === pkg.id && styles.packageCardSelected
                    ]}
                    onPress={() => handlePackageSelect(pkg)}
                  >
                    {tag && (
                      <View style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: tag.backgroundColor,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 16,
                        zIndex: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}>
                        <Text style={{
                          color: tag.color,
                          fontSize: 11,
                          fontWeight: 'bold',
                        }}>
                          {tag.text}
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.packageCardHeader}>
                      <Text style={styles.packageName}>{pkg.packageName}</Text>
                      {selectedPackage?.id === pkg.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#ff4d4d" />
                      )}
                    </View>
                    
                    <View style={styles.packageDetails}>
                      <View style={styles.packageDetail}>
                        <Ionicons name="people-outline" size={16} color="#666" />
                        <Text style={styles.packageDetailText}>Max {pkg.maxPax} passengers</Text>
                      </View>
                      <View style={styles.packageDetail}>
                        <Ionicons name="briefcase-outline" size={16} color="#666" />
                        <Text style={styles.packageDetailText}>Max {pkg.maxLuggage} luggage</Text>
                      </View>
                      <View style={styles.packageDetail}>
                        <Ionicons name="car-outline" size={16} color="#666" />
                        <Text style={styles.packageDetailText}>
                          Vehicle: {pkg.vehicleTypes?.join(', ') || 'Standard'}
                        </Text>
                      </View>
                    </View>
                    
                    {selectedPackage?.id === pkg.id && calculatedPrice && (
                      <View style={styles.priceContainer}>
                        {discountInfo ? (
                          <>
                            <Text style={styles.originalPrice}>₱{originalPrice}</Text>
                            <Text style={styles.discountedPrice}>₱{calculatedPrice}</Text>
                            <Text style={styles.discountBadge}>
                              {discountInfo.type === 'fixed' ? `₱${discountInfo.value} OFF` : `${discountInfo.value}% OFF`}
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.price}>₱{calculatedPrice}</Text>
                        )}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </>
      )}

      {selectedPackage && (
        <>
          <Pressable 
            onPress={togglePassengerSection}
            disabled={!selectedPackage}
          >
            <View style={[
              styles.passengerHeader,
              !selectedPackage && styles.passengerHeaderDisabled
            ]}>
              <Text style={[
                styles.sectionTitle,
                !selectedPackage && styles.sectionTitleDisabled
              ]}>
                Passenger Details
              </Text>
              <Text style={styles.arrow}>
                {isPassengerExpanded ? '▲' : '▼'}
              </Text>
            </View>
          </Pressable>

          {isPassengerExpanded && (
            <View style={styles.passengerDetails}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput 
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={passengerDetails.fullName}
                onChangeText={(text) => handlePassengerChange('fullName', text)}
              />
              
              <Text style={styles.label}>WhatsApp or Contact Number *</Text>
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
                  onChangeText={(text) => handlePassengerChange('contactNumber', text)}
                  onBlur={() => validatePhoneNumber()}
                />
              </View>
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
              
              <Text style={styles.label}>Email Address *</Text>
              <TextInput 
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={passengerDetails.email}
                onChangeText={(text) => handlePassengerChange('email', text)}
              />
              
              <Text style={styles.label}>Special Requests (Optional)</Text>
              <TextInput 
                style={[styles.input, styles.textArea]}
                placeholder="Any special requests?"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                value={passengerDetails.specialRequests}
                onChangeText={(text) => handlePassengerChange('specialRequests', text)}
              />
            </View>
          )}
        </>
      )}

      {isItineraryComplete && selectedArea && !selectedPackage && (
        <View style={styles.infoMessage}>
          <Text style={styles.infoMessageText}>
            ⚠️ Please select a package to continue
          </Text>
        </View>
      )}

      {selectedPackage && !arePassengerDetailsComplete() && (
        <View style={styles.infoMessage}>
          <Text style={styles.infoMessageText}>
            ⚠️ Please fill in all required passenger details (*)
          </Text>
        </View>
      )}

      {isFormComplete() && (
        <Pressable style={styles.button} onPress={handleBookNow}>
          <Text style={styles.buttonText}>Book Now</Text>
        </Pressable>
      )}
      
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
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
            <Text style={styles.modalTitle}>Select Date</Text>
            
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
              <Pressable style={styles.modalButtonConfirm} onPress={confirmDateSelection}>
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
            <Text style={styles.modalTitle}>Select Time (24-hour format)</Text>
            
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
              <Pressable style={styles.modalButtonConfirm} onPress={confirmTimeSelection}>
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
                  onPress={() => handleCountryCodeSelect(country)}
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