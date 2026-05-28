// components/booking/AirportTransferForm1.js
import { View, Text, TextInput, Pressable, ScrollView, Alert, Modal, ActivityIndicator, FlatList } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { styles } from '../../styles/AirportTransferForm.styles';
import { database } from '../../firebaseConfig';
import { ref, get, child } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

export default function AirportTransferForm1({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [originalPrice, setOriginalPrice] = useState(null);
  const [discountInfo, setDiscountInfo] = useState(null);
  
  const [tripType, setTripType] = useState('arrival');
  const [selectedAirport, setSelectedAirport] = useState('NAIA');
  const [selectedTerminal, setSelectedTerminal] = useState('T1');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
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

  // Passenger details state
  const [passengerDetails, setPassengerDetails] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    numPassengers: '',
    specialRequests: ''
  });

  // Load packages from Firebase
  useEffect(() => {
    loadPackages();
  }, []);

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
        // Fallback to mock data for testing
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

  // Load areas based on location
  const loadAreas = async (locationText) => {
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
        // Fallback to mock areas for testing
        setAvailableAreas([
          { id: 'makati', name: 'Makati', prices: { 'Economy 4': '4200', 'Premium 6': '5500', 'Luxury 10': '7500' } },
          { id: 'bgc', name: 'BGC', prices: { 'Economy 4': '4500', 'Premium 6': '5800', 'Luxury 10': '7800' } },
          { id: 'las_pinas', name: 'Las Piñas', prices: { 'Economy 4': '4000', 'Premium 6': '5300', 'Luxury 10': '7300' } },
          { id: 'quezon_city', name: 'Quezon City', prices: { 'Economy 4': '4800', 'Premium 6': '6100', 'Luxury 10': '8100' } }
        ]);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  // Calculate price when package or area changes
  useEffect(() => {
    if (selectedPackage && selectedArea) {
      calculatePrice();
    }
  }, [selectedPackage, selectedArea]);

  const calculatePrice = () => {
    const area = availableAreas.find(a => a.id === selectedArea);
    if (!area || !selectedPackage) return;

    const packageName = selectedPackage.packageName;
    let price = area.prices?.[packageName];
    
    if (price) {
      setOriginalPrice(price);
      
      // Check for discounts
      if (area.discountedPrices) {
        const discount = area.discountedPrices;
        let finalPrice = parseFloat(price);
        
        if (discount.discountType === 'fixed') {
          finalPrice = finalPrice - parseFloat(discount.value);
        } else if (discount.discountType === 'percentage') {
          finalPrice = finalPrice * (1 - parseFloat(discount.value) / 100);
        }
        
        setCalculatedPrice(Math.round(finalPrice).toString());
        setDiscountInfo({
          type: discount.discountType,
          value: discount.value,
          originalPrice: price,
          discountedPrice: Math.round(finalPrice).toString()
        });
      } else {
        setCalculatedPrice(price);
        setDiscountInfo(null);
      }
    } else {
      setCalculatedPrice(null);
      setOriginalPrice(null);
    }
  };

  const airports = {
    NAIA: {
      name: 'Ninoy Aquino International Airport',
      terminals: ['T1', 'T2', 'T3']
    },
    CRK: {
      name: 'Clark International Airport',
      terminals: ['Main Terminal']
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
           passengerDetails.numPassengers.trim() !== '';
  };

  const isPackageSelected = () => {
    return selectedPackage !== null;
  };

  const isFormComplete = () => {
    return isItineraryComplete && isPackageSelected() && calculatedPrice && arePassengerDetailsComplete();
  };

  const checkItineraryComplete = (pickup, dropoff, dateVal, timeVal) => {
    let locationComplete = false;
    
    if (tripType === 'arrival') {
      locationComplete = dropoff.trim() !== '';
      if (dropoff.trim() !== '') {
        loadAreas(dropoff);
      }
    } else {
      locationComplete = pickup.trim() !== '';
      if (pickup.trim() !== '') {
        loadAreas(pickup);
      }
    }
    
    const isDateValid = dateVal.trim() !== '' && validateDate(dateVal);
    const isTimeValid = timeVal.trim() !== '' && validateTime(timeVal);
    const isComplete = locationComplete && isDateValid && isTimeValid;
    
    setIsItineraryComplete(isComplete);
    if (isComplete && !isPackageExpanded) {
      setIsPackageExpanded(true);
    }
  };

  const handleTripTypeChange = (type) => {
    setTripType(type);
    setPickupLocation('');
    setDropoffLocation('');
    setSelectedArea('');
    setSelectedPackage(null);
    setCalculatedPrice(null);
    checkItineraryComplete('', '', date, time);
  };

  const handleAirportChange = (airport) => {
    setSelectedAirport(airport);
    if (airport === 'CRK') {
      setSelectedTerminal('Main Terminal');
    } else {
      setSelectedTerminal('T1');
    }
    checkItineraryComplete(pickupLocation, dropoffLocation, date, time);
  };

  const handleTerminalChange = (terminal) => {
    setSelectedTerminal(terminal);
    checkItineraryComplete(pickupLocation, dropoffLocation, date, time);
  };

  const handlePickupChange = (text) => {
    setPickupLocation(text);
    checkItineraryComplete(text, dropoffLocation, date, time);
  };

  const handleDropoffChange = (text) => {
    setDropoffLocation(text);
    checkItineraryComplete(pickupLocation, text, date, time);
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
    setPassengerDetails({
      ...passengerDetails,
      numPassengers: '' // Reset passenger count when package changes
    });
    
    if (pkg && !isPassengerExpanded) {
      setIsPassengerExpanded(true);
    }
  };

  const handlePassengerChange = (field, value) => {
    if (field === 'numPassengers') {
      const num = parseInt(value);
      if (selectedPackage && num > selectedPackage.maxPax) {
        Alert.alert('Maximum Passengers Exceeded', `This package can only accommodate up to ${selectedPackage.maxPax} passengers.`);
        return;
      }
    }
    setPassengerDetails({
      ...passengerDetails,
      [field]: value
    });
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
    if (isFormComplete()) {
      const bookingData = {
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
        passengerDetails,
        bookingStatus: 'pending',
        timestamp: new Date().toISOString()
      };
      
      console.log('Booking details:', bookingData);
      Alert.alert(
        'Booking Ready!',
        `Package: ${selectedPackage.packageName}\nPrice: ₱${calculatedPrice}\n\nProceed to payment?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed', onPress: () => console.log('Proceed to payment') }
        ]
      );
    }
  };

  // Render item for number picker
  const renderPickerItem = (item, selectedValue, onSelect, labelKey = 'label', valueKey = 'value') => (
    <Pressable
      key={item[valueKey]}
      style={[
        styles.numberPickerItem,
        selectedValue === item[valueKey] && styles.numberPickerItemSelected
      ]}
      onPress={() => onSelect(item[valueKey])}
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

  return (
    <ScrollView 
      style={styles.container}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
    >
      {/* Itinerary Section */}
      <View style={styles.itinerary}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        
        {/* Radio Buttons for Arrival/Departure */}
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

        {/* Airport Selection */}
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

        {/* Terminal Selection - Only show for NAIA */}
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

        {/* Pickup Location */}
        <Text style={styles.label}>{getPickupLabel()}</Text>
        {tripType === 'arrival' ? (
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{getPickupValue()}</Text>
          </View>
        ) : (
          <TextInput 
            style={styles.input}
            placeholder="Enter your pickup location"
            placeholderTextColor="#999"
            value={pickupLocation}
            onChangeText={handlePickupChange}
          />
        )}

        {/* Dropoff Location */}
        <Text style={styles.label}>{getDropoffLabel()}</Text>
        {tripType === 'departure' ? (
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{getDropoffValue()}</Text>
          </View>
        ) : (
          <TextInput 
            style={styles.input}
            placeholder="Enter your destination"
            placeholderTextColor="#999"
            value={dropoffLocation}
            onChangeText={handleDropoffChange}
          />
        )}

        {/* Date Field - Picker Button */}
        <Text style={styles.label}>Date (MM-DD-YYYY)</Text>
        <Pressable style={styles.pickerButton} onPress={openDatePicker}>
          <Text style={date ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
            {date || "Select Date"}
          </Text>
        </Pressable>
        {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

        {/* Time Field - Picker Button */}
        <Text style={styles.label}>Time (HH:MM UTC+8 - 24-hour format)</Text>
        <Pressable style={styles.pickerButton} onPress={openTimePicker}>
          <Text style={time ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
            {time || "Select Time"}
          </Text>
        </Pressable>
        {timeError ? <Text style={styles.errorText}>{timeError}</Text> : null}
        <Text style={styles.hintText}>Example: 14:30 = 2:30 PM Philippine Time</Text>
      </View>

      {/* Area Selection - Shown after itinerary complete */}
      {isItineraryComplete && availableAreas.length > 0 && (
        <View style={styles.areaSection}>
          <Text style={styles.sectionTitle}>Select Your Area</Text>
          <Text style={styles.hintText}>
            Please select the area for your {tripType === 'arrival' ? 'destination' : 'pickup'} location
          </Text>
          <View style={styles.areaGroup}>
            {availableAreas.map((area) => (
              <Pressable
                key={area.id}
                style={[styles.areaOption, selectedArea === area.id && styles.areaSelected]}
                onPress={() => setSelectedArea(area.id)}
              >
                <Text style={[styles.areaLabel, selectedArea === area.id && styles.areaLabelSelected]}>
                  {area.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Package Selection Section - Collapsible */}
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
              {packages.map((pkg) => (
                <Pressable
                  key={pkg.id}
                  style={[
                    styles.packageCard,
                    selectedPackage?.id === pkg.id && styles.packageCardSelected
                  ]}
                  onPress={() => handlePackageSelect(pkg)}
                >
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
              ))}
            </View>
          )}
        </>
      )}

      {/* Passenger Details Section - Collapsible */}
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
              
              <Text style={styles.label}>Contact Number *</Text>
              <TextInput 
                style={styles.input}
                placeholder="Enter your contact number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={passengerDetails.contactNumber}
                onChangeText={(text) => handlePassengerChange('contactNumber', text)}
              />
              
              <Text style={styles.label}>Email Address *</Text>
              <TextInput 
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={passengerDetails.email}
                onChangeText={(text) => handlePassengerChange('email', text)}
              />
              
              <Text style={styles.label}>
                Number of Passengers * (Max: {selectedPackage?.maxPax})
              </Text>
              <TextInput 
                style={styles.input}
                placeholder={`Number of passengers (max ${selectedPackage?.maxPax})`}
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={passengerDetails.numPassengers}
                onChangeText={(text) => handlePassengerChange('numPassengers', text)}
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

      {/* Required fields indicator */}
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

      {/* Action Buttons - Book Now only visible when form is complete */}
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
                  style={styles.numberPicker}
                  showsVerticalScrollIndicator={false}
                >
                  {months.map((month) => renderPickerItem(month, tempMonth, setTempMonth))}
                </ScrollView>
              </View>

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabelText}>Day</Text>
                <ScrollView 
                  style={styles.numberPicker}
                  showsVerticalScrollIndicator={false}
                >
                  {days.map((day) => renderPickerItem(day, tempDay, setTempDay))}
                </ScrollView>
              </View>

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabelText}>Year</Text>
                <ScrollView 
                  style={styles.numberPicker}
                  showsVerticalScrollIndicator={false}
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
                  style={styles.numberPicker}
                  showsVerticalScrollIndicator={false}
                >
                  {hours.map((hour) => renderPickerItem(hour, tempHour, setTempHour))}
                </ScrollView>
              </View>

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabelText}>Minute</Text>
                <ScrollView 
                  style={styles.numberPicker}
                  showsVerticalScrollIndicator={false}
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
    </ScrollView>
  );
}