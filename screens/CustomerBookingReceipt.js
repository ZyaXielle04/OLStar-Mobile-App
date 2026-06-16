// screens/CustomerBookingReceipt.js
import { View, Text, ScrollView, Pressable, Share, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { styles } from '../styles/CustomerBookingReceipt.styles';
import AppModal from '../components/AppModal';
import { database } from '../firebaseConfig';
import { ref, onValue, off } from 'firebase/database';

export default function CustomerBookingReceipt({ route, navigation }) {
  const { bookingId, booking: passedBooking } = route.params || {};
  
  const [booking, setBooking] = useState(passedBooking || null);
  const [loading, setLoading] = useState(!passedBooking);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!booking && bookingId) {
      fetchBookingDetails();
    } else if (booking) {
      const transformed = transformFirebaseBooking(booking, booking.id);
      setBooking(transformed);
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = () => {
    if (!bookingId) {
      showModal('Booking ID not provided', false);
      return;
    }
    
    setLoading(true);
    const bookingRef = ref(database, `pendingBooking/${bookingId}`);
    
    const unsubscribe = onValue(bookingRef, (snapshot) => {
      if (snapshot.exists()) {
        const bookingData = snapshot.val();
        const transformedBooking = transformFirebaseBooking(bookingData, bookingId);
        setBooking(transformedBooking);
      } else {
        showModal('Booking not found', false);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching booking:', error);
      showModal('Failed to load booking details', false);
      setLoading(false);
    });

    return () => off(bookingRef);
  };

  const transformFirebaseBooking = (data, id) => {
    const type = data.bookingType;
    
    let paymentDateValue = data.paidAt || data.paymentDate || data.timestamp;
    if (typeof paymentDateValue === 'number') {
      paymentDateValue = new Date(paymentDateValue).toISOString();
    }
    
    // Extract status - prefer booking status over payment status
    const bookingStatus = data.status || 'unassigned';
    
    const baseReceipt = {
      id: id,
      bookingId: data.bookingId || id,
      serviceType: type,
      status: bookingStatus,
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod,
      paymentDate: paymentDateValue,
      amount: data.amount,
      timestamp: data.timestamp,
      source: data.source,
      clientId: data.clientId,
      clientName: data.clientName,
      email: data.email,
      contactNumber: data.contactNumber,
      note: data.note || '',
      adminNotes: data.adminNotes || null,
      driverAssigned: data.driverAssigned || null,
      vehicleAssigned: data.vehicleAssigned || null,
      statusUpdates: data.statusUpdates || [],
      lastUpdatedByAdmin: data.lastUpdatedByAdmin || null,
      adminRemarks: data.adminRemarks || null
    };

    if (type === 'airportTransfer') {
      return {
        ...baseReceipt,
        serviceType: 'airport',
        pickupLocation: data.pickup || data.pickupLocation,
        dropoffLocation: data.dropoff || data.dropoffLocation,
        date: data.date,
        time: data.time,
        passengers: data.passengers,
        packageType: data.packageType
      };
    }
    
    if (type === 'manilaCarRental') {
      return {
        ...baseReceipt,
        serviceType: 'metro',
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        travelDate: data.travelDate,
        pickupTime: data.pickupTime,
        duration: data.duration,
        vehicleType: data.vehicleType,
        package: data.package,
        area: data.area,
        plannedItinerary: data.plannedItinerary
      };
    }
    
    if (type === 'provincialCarRental') {
      return {
        ...baseReceipt,
        serviceType: 'provincial',
        pickupLocation: data.pickupLocation,
        travelDate: data.travelDate,
        pickupTime: data.pickupTime,
        vehicleType: data.vehicleType,
        tripType: data.tripType,
        tripTypeId: data.tripTypeId,
        destination: data.destination,
        destinationId: data.destinationId,
        numPassengers: data.numPassengers || data.passengers
      };
    }
    
    if (type === 'selfDriveCarRental') {
      return {
        ...baseReceipt,
        serviceType: 'selfdrive',
        pickupLocation: data.pickUpLocation || data.pickupLocation,
        dropoffLocation: data.returnLocation || data.dropoffLocation,
        pickupDate: data.date,
        pickupTime: data.pickupTime,
        returnDateTime: data.returnDateTime,
        rentalDuration: data.rentalDuration,
        unitId: data.unitId,
        carType: data.carType,
        vehicleType: data.vehicleType,
        vehicleColor: data.vehicleColor,
        driverLicenseNumber: data.driverLicenseNumber,
        originalPrice: data.originalPrice,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        deliveryFee: data.deliveryFee
      };
    }
    
    return baseReceipt;
  };

  const showModal = (message, isSuccessMessage = false) => {
    setModalMessage(message);
    setIsSuccess(isSuccessMessage);
    setModalVisible(true);
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '₱0';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    if (typeof dateString !== 'string') {
      dateString = String(dateString);
    }
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[0]}/${parts[1]}/${parts[2]}`;
      }
    }
    return dateString;
  };

  const convertToPhilippineTime = (dateValue) => {
    if (!dateValue) return null;
    try {
      let date = typeof dateValue === 'number' ? new Date(dateValue) : new Date(dateValue);
      if (isNaN(date.getTime())) return null;
      return new Date(date.getTime() + (8 * 60 * 60 * 1000));
    } catch (error) {
      return null;
    }
  };

  const formatFullDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const philippineDate = convertToPhilippineTime(dateValue);
    if (!philippineDate) return 'N/A';
    try {
      return philippineDate.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getServiceName = () => {
    if (!booking) return 'Loading...';
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
    return serviceNames[booking.serviceType] || 'Car Rental';
  };

  const getTripTypeLabel = () => {
    if (!booking?.tripType) return '';
    const types = {
      'One-way': 'One-way',
      'Round Trip': 'Round Trip',
      'Tour': 'Tour'
    };
    return types[booking.tripType] || booking.tripType;
  };

  // ✅ UPDATED: Status functions for 4 status types
  const getStatusColor = () => {
    if (!booking) return '#666';
    const status = booking?.status || 'unassigned';
    
    switch(status) {
      case 'unassigned':
        return '#ff9800'; // Orange - waiting for assignment
      case 'assigned':
        return '#2196f3'; // Blue - driver/vehicle assigned
      case 'completed':
        return '#4caf50'; // Green - service completed
      case 'cancelled':
        return '#f44336'; // Red - cancelled
      default:
        return '#666';
    }
  };

  const getStatusText = () => {
    if (!booking) return 'LOADING';
    const status = booking?.status || 'unassigned';
    
    switch(status) {
      case 'unassigned':
        return 'PENDING ASSIGNMENT';
      case 'assigned':
        return 'ASSIGNED';
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status?.toUpperCase() || 'UNASSIGNED';
    }
  };

  const getStatusIcon = () => {
    if (!booking) return 'time-outline';
    const status = booking?.status || 'unassigned';
    
    switch(status) {
      case 'unassigned':
        return 'time-outline';
      case 'assigned':
        return 'checkmark-circle-outline';
      case 'completed':
        return 'checkmark-done-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'time-outline';
    }
  };

  const formatVehicleType = (type) => {
    if (!type) return 'Not specified';
    const types = {
      'sedan': 'Sedan',
      'suv_mpv': 'SUV/MPV',
      'van': 'Van'
    };
    return types[type] || type;
  };

  const renderDetailItem = (icon, label, value) => {
    // Don't render if value is null, undefined, or empty
    if (value === null || value === undefined) return null;
    
    let displayValue = '';
    
    // Convert different types to string safely
    if (typeof value === 'string') {
      displayValue = value;
    } else if (typeof value === 'number') {
      displayValue = value.toString();
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'Yes' : 'No';
    } else if (value instanceof Date) {
      displayValue = value.toLocaleDateString();
    } else {
      displayValue = String(value);
    }
    
    // Don't render empty strings
    if (!displayValue || displayValue.trim() === '') {
      return null;
    }
    
    return (
      <View style={styles.detailRow}>
        <View style={styles.detailIcon}>
          <Ionicons name={icon} size={20} color="#6c757d" />
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailText}>{displayValue}</Text>
        </View>
      </View>
    );
  };

  const renderServiceSpecificDetails = () => {
    if (!booking) return null;
    
    switch(booking.serviceType) {
      case 'provincial':
      case 'provincialCarRental':
        return (
          <View style={styles.detailCard}>
            {renderDetailItem('location-outline', 'Pickup Location', booking.pickupLocation)}
            {renderDetailItem('flag-outline', 'Destination', booking.destination)}
            {renderDetailItem('swap-horizontal-outline', 'Trip Type', getTripTypeLabel())}
            {renderDetailItem('car-outline', 'Vehicle Type', formatVehicleType(booking.vehicleType))}
            {renderDetailItem('calendar-outline', 'Travel Date', formatDate(booking.travelDate))}
            {renderDetailItem('time-outline', 'Pickup Time', booking.pickupTime || 'Flexible')}
            {renderDetailItem('people-outline', 'Number of Passengers', booking.numPassengers ? String(booking.numPassengers) : '1')}
          </View>
        );

      case 'metro':
      case 'manilaCarRental':
        return (
          <View style={styles.detailCard}>
            {renderDetailItem('location-outline', 'Pickup Location', booking.pickupLocation || 'Metro Manila Area')}
            {renderDetailItem('navigate-outline', 'Dropoff Location', booking.dropoffLocation || 'Metro Manila Area')}
            {renderDetailItem('car-outline', 'Vehicle Type', formatVehicleType(booking.vehicleType))}
            {renderDetailItem('gift-outline', 'Package', booking.package === 'all-inclusive' ? 'All-inclusive' : 'Regular')}
            {renderDetailItem('calendar-outline', 'Travel Date', formatDate(booking.travelDate))}
            {renderDetailItem('time-outline', 'Pickup Time', booking.pickupTime || 'Flexible')}
            {renderDetailItem('hourglass-outline', 'Duration', booking.duration || 'Not specified')}
          </View>
        );

      case 'airport':
      case 'airportTransfer':
        return (
          <View style={styles.detailCard}>
            {renderDetailItem('location-outline', 'Pickup Location', booking.pickupLocation)}
            {renderDetailItem('airplane-outline', 'Dropoff Location', booking.dropoffLocation)}
            {renderDetailItem('calendar-outline', 'Date', formatDate(booking.date))}
            {renderDetailItem('time-outline', 'Time', booking.time || 'Flexible')}
            {renderDetailItem('people-outline', 'Passengers', booking.passengers ? String(booking.passengers) : '1')}
          </View>
        );

      case 'selfdrive':
      case 'selfDriveCarRental':
        return (
          <View style={styles.detailCard}>
            {renderDetailItem('car-outline', 'Vehicle', booking.carType || 'Not specified')}
            {booking.vehicleType ? renderDetailItem('options-outline', 'Vehicle Type', formatVehicleType(booking.vehicleType)) : null}
            {booking.vehicleColor ? renderDetailItem('color-palette-outline', 'Color', booking.vehicleColor) : null}
            {booking.unitId ? renderDetailItem('id-card-outline', 'Unit ID', booking.unitId) : null}
            {renderDetailItem('location-outline', 'Pickup Location', booking.pickupLocation)}
            {renderDetailItem('navigate-outline', 'Dropoff Location', booking.dropoffLocation || 'Same as pickup')}
            {renderDetailItem('calendar-outline', 'Pickup Date', formatDate(booking.pickupDate))}
            {renderDetailItem('time-outline', 'Pickup Time', booking.pickupTime || 'Flexible')}
            {booking.returnDateTime ? renderDetailItem('calendar-outline', 'Return Date & Time', booking.returnDateTime) : null}
            {renderDetailItem('hourglass-outline', 'Duration', booking.rentalDuration || 'Not specified')}
            {booking.driverLicenseNumber ? renderDetailItem('id-card-outline', 'License Number', booking.driverLicenseNumber) : null}
            {booking.deliveryFee > 0 ? renderDetailItem('cash-outline', 'Delivery Fee', formatPrice(booking.deliveryFee)) : null}
          </View>
        );

      default:
        return (
          <View style={styles.detailCard}>
            <Text style={styles.detailText}>No additional details available</Text>
          </View>
        );
    }
  };

  const renderAdminUpdates = () => {
    if (!booking) return null;
    
    const hasUpdates = booking.driverAssigned || booking.vehicleAssigned || 
                      booking.adminNotes || booking.adminRemarks || 
                      (booking.statusUpdates && booking.statusUpdates.length > 0);

    if (!hasUpdates) return null;

    return (
      <View style={styles.adminSection}>
        <View style={styles.adminHeader}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#1976d2" />
          <Text style={styles.adminTitle}>Admin Updates</Text>
        </View>
        
        {booking.driverAssigned ? (
          <View style={styles.adminRow}>
            <Ionicons name="person-circle-outline" size={20} color="#1976d2" />
            <View style={styles.adminContent}>
              <Text style={styles.adminLabel}>Driver Assigned</Text>
              <Text style={styles.adminValue}>{booking.driverAssigned}</Text>
            </View>
          </View>
        ) : null}
        
        {booking.vehicleAssigned ? (
          <View style={styles.adminRow}>
            <Ionicons name="car-outline" size={20} color="#1976d2" />
            <View style={styles.adminContent}>
              <Text style={styles.adminLabel}>Vehicle Assigned</Text>
              <Text style={styles.adminValue}>{booking.vehicleAssigned}</Text>
            </View>
          </View>
        ) : null}
        
        {booking.adminNotes ? (
          <View style={styles.adminRow}>
            <Ionicons name="document-text-outline" size={20} color="#ff9800" />
            <View style={styles.adminContent}>
              <Text style={styles.adminLabel}>Important Notes</Text>
              <Text style={styles.adminValue}>{booking.adminNotes}</Text>
            </View>
          </View>
        ) : null}
        
        {booking.adminRemarks ? (
          <View style={styles.adminRow}>
            <Ionicons name="chatbubble-outline" size={20} color="#ff9800" />
            <View style={styles.adminContent}>
              <Text style={styles.adminLabel}>Remarks</Text>
              <Text style={styles.adminValue}>{booking.adminRemarks}</Text>
            </View>
          </View>
        ) : null}
        
        {booking.statusUpdates && booking.statusUpdates.map((update, index) => (
          <View key={index} style={styles.updateRow}>
            <Ionicons name="time-outline" size={16} color="#6c757d" />
            <Text style={styles.updateText}>
              {update.message || ''} - {formatFullDate(update.timestamp)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const handleShare = async () => {
    if (!booking) return;
    
    try {
      let receiptText = `
━━━━━━━━━━━━━━━━━━━━━━
   OLSTAR BOOKING RECEIPT
━━━━━━━━━━━━━━━━━━━━━━

Booking ID: ${booking.bookingId || booking.id}
Service: ${getServiceName()}
Status: ${getStatusText()}

━━━━━━━━━━━━━━━━━━━━━━
      DETAILS
━━━━━━━━━━━━━━━━━━━━━━
`;
      
      // Add service-specific details to share text
      if (booking.serviceType === 'provincial' || booking.serviceType === 'provincialCarRental') {
        receiptText += `
Pickup Location: ${booking.pickupLocation || 'Not specified'}
Destination: ${booking.destination || 'Not specified'}
Trip Type: ${getTripTypeLabel()}
Vehicle Type: ${formatVehicleType(booking.vehicleType)}
Travel Date: ${formatDate(booking.travelDate)}
Pickup Time: ${booking.pickupTime || 'Flexible'}
Passengers: ${booking.numPassengers || '1'}
`;
      } else if (booking.serviceType === 'metro' || booking.serviceType === 'manilaCarRental') {
        receiptText += `
Pickup Location: ${booking.pickupLocation || 'Metro Manila Area'}
Dropoff Location: ${booking.dropoffLocation || 'Metro Manila Area'}
Vehicle Type: ${formatVehicleType(booking.vehicleType)}
Package: ${booking.package === 'all-inclusive' ? 'All-inclusive' : 'Regular'}
Travel Date: ${formatDate(booking.travelDate)}
Pickup Time: ${booking.pickupTime || 'Flexible'}
Duration: ${booking.duration || 'Not specified'}
`;
      } else if (booking.serviceType === 'airport' || booking.serviceType === 'airportTransfer') {
        receiptText += `
Pickup Location: ${booking.pickupLocation || 'Not specified'}
Dropoff Location: ${booking.dropoffLocation || 'Not specified'}
Date: ${formatDate(booking.date)}
Time: ${booking.time || 'Flexible'}
Passengers: ${booking.passengers || '1'}
`;
      } else if (booking.serviceType === 'selfdrive' || booking.serviceType === 'selfDriveCarRental') {
        receiptText += `
Vehicle: ${booking.carType || 'Not specified'}
${booking.vehicleType ? `Vehicle Type: ${formatVehicleType(booking.vehicleType)}\n` : ''}
${booking.vehicleColor ? `Color: ${booking.vehicleColor}\n` : ''}
${booking.unitId ? `Unit ID: ${booking.unitId}\n` : ''}
Pickup Location: ${booking.pickupLocation || 'Not specified'}
Dropoff Location: ${booking.dropoffLocation || 'Same as pickup'}
Pickup Date: ${formatDate(booking.pickupDate)}
Pickup Time: ${booking.pickupTime || 'Flexible'}
${booking.returnDateTime ? `Return Date & Time: ${booking.returnDateTime}\n` : ''}
Duration: ${booking.rentalDuration || 'Not specified'}
${booking.driverLicenseNumber ? `License Number: ${booking.driverLicenseNumber}\n` : ''}
${booking.deliveryFee > 0 ? `Delivery Fee: ${formatPrice(booking.deliveryFee)}\n` : ''}
`;
      }
      
      receiptText += `
━━━━━━━━━━━━━━━━━━━━━━
      PAYMENT
━━━━━━━━━━━━━━━━━━━━━━

Amount: ${formatPrice(booking.amount)}
Payment Method: ${booking.paymentMethod?.toUpperCase() || 'N/A'}
Payment Date: ${formatFullDate(booking.paymentDate || booking.timestamp)}

━━━━━━━━━━━━━━━━━━━━━━
      CONTACT
━━━━━━━━━━━━━━━━━━━━━━

Name: ${booking.clientName || 'N/A'}
Email: ${booking.email || 'N/A'}
Contact: ${booking.contactNumber || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━
Thank you for choosing OLStar! ✨
      `;
      
      await Share.share({
        message: receiptText,
        title: `OLStar Booking Receipt - ${booking.bookingId || booking.id}`
      });
      showModal('Receipt shared successfully!', true);
    } catch (error) {
      console.error('Share error:', error);
      showModal('Failed to share receipt. Please try again.', false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4d4d" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4d4d" />
        <Text style={styles.errorTitle}>No booking found</Text>
        <Text style={styles.errorMessage}>Unable to load booking details</Text>
        <Pressable style={styles.homeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.homeButtonText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor();
  const statusText = getStatusText();
  const statusIcon = getStatusIcon();

  return (
    <SafeAreaView style={styles.container}>
      <AppModal
        visible={modalVisible}
        message={modalMessage}
        isRedirecting={false}
        onClose={() => setModalVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.receiptContainer}>
          {/* Colored Header */}
          <View style={[styles.headerGradient, { backgroundColor: statusColor }]}>
            <View style={styles.successIcon}>
              <Ionicons name={statusIcon} size={50} color="#ffffff" />
            </View>
            <Text style={styles.title}>
              {statusText === 'PENDING ASSIGNMENT' ? 'Booking Confirmed!' : 
               statusText === 'ASSIGNED' ? 'Booking Assigned!' :
               statusText === 'COMPLETED' ? 'Service Completed!' :
               statusText === 'CANCELLED' ? 'Booking Cancelled' : 'Booking Details'}
            </Text>
            <Text style={styles.subtitle}>
              {statusText === 'PENDING ASSIGNMENT' && 'We are currently assigning a driver and vehicle for you'}
              {statusText === 'ASSIGNED' && 'A driver and vehicle have been assigned to your booking'}
              {statusText === 'COMPLETED' && 'This service has been completed successfully'}
              {statusText === 'CANCELLED' && 'This booking has been cancelled'}
              {!['PENDING ASSIGNMENT', 'ASSIGNED', 'COMPLETED', 'CANCELLED'].includes(statusText) && 'Your booking details are shown below'}
            </Text>
          </View>

          {/* Floating Booking ID Card */}
          <View style={styles.bookingIdCard}>
            <View style={styles.bookingIdInfo}>
              <Text style={styles.bookingIdLabel}>BOOKING ID</Text>
              <Text style={styles.bookingIdValue}>{booking.bookingId || booking.id}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
          </View>

          <View style={styles.contentWrapper}>
            {/* Service Details */}
            <View style={styles.section}>
              <View style={styles.sectionTitle}>
                <Ionicons name="car-sport-outline" size={22} color="#ff4d4d" />
                <Text style={styles.sectionTitleText}>Service Details</Text>
              </View>
              {renderServiceSpecificDetails()}
            </View>

            {/* Passenger Details */}
            <View style={styles.section}>
              <View style={styles.sectionTitle}>
                <Ionicons name="person-outline" size={22} color="#ff4d4d" />
                <Text style={styles.sectionTitleText}>Passenger Details</Text>
              </View>
              <View style={styles.detailCard}>
                {renderDetailItem('person-outline', 'Full Name', booking.clientName)}
                {renderDetailItem('mail-outline', 'Email Address', booking.email)}
                {renderDetailItem('call-outline', 'Contact Number', booking.contactNumber)}
                {booking.note ? renderDetailItem('document-text-outline', 'Special Request', booking.note) : null}
              </View>
            </View>

            {/* Admin Updates */}
            {renderAdminUpdates()}

            {/* Payment Summary */}
            <View style={styles.section}>
              <View style={styles.sectionTitle}>
                <Ionicons name="card-outline" size={22} color="#ff4d4d" />
                <Text style={styles.sectionTitleText}>Payment Summary</Text>
              </View>
              <View style={styles.paymentSummary}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Subtotal</Text>
                  <Text style={styles.priceValue}>{formatPrice(booking.amount)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Paid</Text>
                  <Text style={styles.totalValue}>{formatPrice(booking.amount)}</Text>
                </View>
                <View style={styles.paymentMethodRow}>
                  <Ionicons name="card-outline" size={18} color="#6c757d" />
                  <Text style={styles.paymentMethodText}>
                    Paid via {booking.paymentMethod?.toUpperCase() || 'N/A'}
                  </Text>
                </View>
                <View style={styles.paymentDateRow}>
                  <Ionicons name="calendar-outline" size={16} color="#6c757d" />
                  <Text style={styles.paymentDateText}>
                    Paid on: {formatFullDate(booking.timestamp)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Important Notes */}
            <View style={styles.notesSection}>
              <View style={styles.notesHeader}>
                <Ionicons name="bulb-outline" size={22} color="#e65100" />
                <Text style={styles.notesTitle}>Important Notes</Text>
              </View>
              <View style={styles.noteItem}>
                <Ionicons name="time-outline" size={16} color="#ff9800" />
                <Text style={styles.noteText}>Please be ready 30 minutes before scheduled time</Text>
              </View>
              <View style={styles.noteItem}>
                <Ionicons name="call-outline" size={16} color="#ff9800" />
                <Text style={styles.noteText}>Contact us at +63 123 456 7890 for assistance</Text>
              </View>
              <View style={styles.noteItem}>
                <Ionicons name="mail-outline" size={16} color="#ff9800" />
                <Text style={styles.noteText}>A confirmation email has been sent to your email</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#fff" />
            <Text style={styles.shareButtonText}>Share</Text>
          </Pressable>
          <Pressable style={styles.homeButton} onPress={() => navigation.navigate('CustomerBookings')}>
            <Ionicons name="bookmark-outline" size={20} color="#fff" />
            <Text style={styles.homeButtonText}>My Bookings</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}