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

  // If only bookingId is passed, fetch from Firebase
  useEffect(() => {
    if (!booking && bookingId) {
      fetchBookingDetails();
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
    
    // Get payment date - try paidAt first, then timestamp, then paymentDate
    let paymentDateValue = data.paidAt || data.paymentDate || data.timestamp;
    
    // If timestamp is a number (epoch), convert it to ISO string
    if (typeof paymentDateValue === 'number') {
      paymentDateValue = new Date(paymentDateValue).toISOString();
    }
    
    const baseReceipt = {
      id: id,
      bookingId: id,
      serviceType: type,
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod,
      paymentDate: paymentDateValue,
      amount: data.amount,
      timestamp: data.timestamp,
      source: data.source,
      status: data.status,
      clientId: data.clientId,
      clientName: data.clientName,
      email: data.email,
      contactNumber: data.contactNumber,
      note: data.note || '',
      // Admin fields (can be updated by admin later)
      adminNotes: data.adminNotes || null,
      driverAssigned: data.driverAssigned || null,
      vehicleAssigned: data.vehicleAssigned || null,
      statusUpdates: data.statusUpdates || [],
      lastUpdatedByAdmin: data.lastUpdatedByAdmin || null,
      adminRemarks: data.adminRemarks || null
    };

    // Airport Transfer specific
    if (type === 'airportTransfer') {
      return {
        ...baseReceipt,
        serviceType: 'airport',
        pickupLocation: data.pickup,
        dropoffLocation: data.dropoff,
        date: data.date,
        time: data.time,
        passengers: data.passengers,
        packageType: data.packageType
      };
    }
    
    // Metro/Manila Car Rental specific
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
    
    // Provincial Car Rental specific
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
        numPassengers: data.numPassengers
      };
    }
    
    // Self Drive Car Rental specific
    if (type === 'selfDriveCarRental') {
      return {
        ...baseReceipt,
        serviceType: 'selfdrive',
        pickupLocation: data.pickup,
        dropoffLocation: data.dropoff,
        pickupDate: data.date,
        pickupTime: data.pickupTime,
        returnDateTime: data.returnDateTime,
        rentalDuration: data.rentalDuration,
        carType: data.carType,
        driverLicenseNumber: data.driverLicenseNumber
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
    if (!price) return '₱0';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
    return dateString;
  };

  const convertToPhilippineTime = (dateValue) => {
    if (!dateValue) return null;
    
    try {
      let date;
      
      // Handle epoch timestamp (number)
      if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      } 
      // Handle string date
      else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      }
      // Handle if it's already a Date object
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      else {
        return null;
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return null;
      }
      
      // Convert to UTC+8 (Philippine Time)
      // Add 8 hours to UTC time
      const philippineTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));
      
      return philippineTime;
    } catch (error) {
      console.error('Error converting to Philippine time:', error);
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
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const formatShortDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    const philippineDate = convertToPhilippineTime(dateValue);
    
    if (!philippineDate) return 'N/A';
    
    try {
      return philippineDate.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting short date:', error);
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
    switch(booking.tripType) {
      case 'One-way': return 'One-way';
      case 'Round Trip': return 'Round Trip';
      case 'Tour': return 'Tour';
      default: return booking.tripType;
    }
  };

  const getStatusColor = () => {
    if (!booking) return '#666';
    const status = booking?.paymentStatus || booking?.status;
    if (status === 'paid' || status === 'CONFIRMED') return '#4caf50';
    if (status === 'pending' || status === 'PENDING') return '#ff9800';
    if (status === 'cancelled' || status === 'CANCELLED') return '#f44336';
    if (status === 'completed' || status === 'COMPLETED') return '#2196f3';
    if (status === 'unassigned') return '#ff9800';
    return '#666';
  };

  const getStatusText = () => {
    if (!booking) return 'LOADING';
    const status = booking?.paymentStatus || booking?.status;
    if (status === 'paid') return 'CONFIRMED';
    if (status === 'pending') return 'PENDING';
    if (status === 'cancelled') return 'CANCELLED';
    if (status === 'completed') return 'COMPLETED';
    if (status === 'unassigned') return 'CONFIRMED';
    return status?.toUpperCase() || 'CONFIRMED';
  };

  const renderServiceSpecificDetails = () => {
    if (!booking) return null;
    
    switch(booking.serviceType) {
      case 'provincial':
      case 'provincialCarRental':
        return (
          <>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.detailText} numberOfLines={2}>
                Pickup: {booking.pickupLocation || 'Not specified'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="flag-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Destination: {booking.destination || 'Not specified'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="swap-horizontal-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Trip Type: {getTripTypeLabel()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="car-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Vehicle: {booking.vehicleType || 'Not specified'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Travel Date: {formatDate(booking.travelDate)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Pickup Time: {booking.pickupTime || 'Flexible'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Passengers: {booking.numPassengers || 1}
              </Text>
            </View>
          </>
        );

      case 'metro':
      case 'manilaCarRental':
        return (
          <>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.detailText} numberOfLines={2}>
                Pickup: {booking.pickupLocation || 'Metro Manila Area'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="navigate-outline" size={20} color="#666" />
              <Text style={styles.detailText} numberOfLines={2}>
                Dropoff: {booking.dropoffLocation || 'Metro Manila Area'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="car-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Vehicle: {booking.vehicleType || 'Not specified'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="gift-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Package: {booking.package === 'all-inclusive' ? 'All-inclusive' : 'Regular'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Travel Date: {formatDate(booking.travelDate)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Pickup Time: {booking.pickupTime || 'Flexible'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="hourglass-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Duration: {booking.duration || 'Not specified'}
              </Text>
            </View>
          </>
        );

      case 'airport':
      case 'airportTransfer':
        return (
          <>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.detailText} numberOfLines={2}>
                Pickup: {booking.pickupLocation || 'Not specified'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="airplane-outline" size={20} color="#666" />
              <Text style={styles.detailText} numberOfLines={2}>
                Dropoff: {booking.dropoffLocation || 'Not specified'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Date: {formatDate(booking.date)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Time: {booking.time || 'Flexible'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Passengers: {booking.passengers || 1}
              </Text>
            </View>
          </>
        );

      case 'selfdrive':
      case 'selfDriveCarRental':
        return (
          <>
            <View style={styles.detailRow}>
              <Ionicons name="car-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Vehicle: {booking.carType || 'Not specified'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.detailText} numberOfLines={2}>
                Pickup Location: {booking.pickupLocation || 'Not specified'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Pickup Date: {formatDate(booking.pickupDate)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Pickup Time: {booking.pickupTime || 'Flexible'}
              </Text>
            </View>
            {booking.returnDateTime && (
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  Return: {formatDate(booking.returnDateTime)}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Ionicons name="hourglass-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Duration: {booking.rentalDuration || 'Not specified'}
              </Text>
            </View>
            {booking.driverLicenseNumber && (
              <View style={styles.detailRow}>
                <Ionicons name="id-card-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  License: {booking.driverLicenseNumber}
                </Text>
              </View>
            )}
          </>
        );

      default:
        return null;
    }
  };

  const renderAdminUpdates = () => {
    if (!booking) return null;
    
    // Check if there are any admin updates
    const hasDriver = booking.driverAssigned;
    const hasVehicle = booking.vehicleAssigned;
    const hasAdminNotes = booking.adminNotes;
    const hasAdminRemarks = booking.adminRemarks;
    const hasStatusUpdates = booking.statusUpdates && booking.statusUpdates.length > 0;

    if (!hasDriver && !hasVehicle && !hasAdminNotes && !hasAdminRemarks && !hasStatusUpdates) {
      return null;
    }

    return (
      <View style={styles.adminSection}>
        <Text style={styles.sectionTitle}>Updates from Admin</Text>
        
        {booking.driverAssigned && (
          <View style={styles.adminRow}>
            <Ionicons name="person-circle-outline" size={20} color="#2196f3" />
            <View style={styles.adminContent}>
              <Text style={styles.adminLabel}>Driver Assigned</Text>
              <Text style={styles.adminValue}>{booking.driverAssigned}</Text>
            </View>
          </View>
        )}
        
        {booking.vehicleAssigned && (
          <View style={styles.adminRow}>
            <Ionicons name="car-outline" size={20} color="#2196f3" />
            <View style={styles.adminContent}>
              <Text style={styles.adminLabel}>Vehicle Assigned</Text>
              <Text style={styles.adminValue}>{booking.vehicleAssigned}</Text>
            </View>
          </View>
        )}
        
        {booking.adminNotes && (
          <View style={styles.adminRow}>
            <Ionicons name="document-text-outline" size={20} color="#ff9800" />
            <View style={styles.adminContent}>
              <Text style={styles.adminLabel}>Notes</Text>
              <Text style={styles.adminValue}>{booking.adminNotes}</Text>
            </View>
          </View>
        )}
        
        {booking.adminRemarks && (
          <View style={styles.adminRow}>
            <Ionicons name="chatbubble-outline" size={20} color="#ff9800" />
            <View style={styles.adminContent}>
              <Text style={styles.adminLabel}>Remarks</Text>
              <Text style={styles.adminValue}>{booking.adminRemarks}</Text>
            </View>
          </View>
        )}
        
        {booking.statusUpdates && booking.statusUpdates.map((update, index) => (
          <View key={index} style={styles.updateRow}>
            <Ionicons name="time-outline" size={16} color="#999" />
            <Text style={styles.updateText}>
              {update.message} - {formatFullDate(update.timestamp)}
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
📋 OLSTAR BOOKING RECEIPT
━━━━━━━━━━━━━━━━━━━━━━

Booking ID: ${booking.bookingId}
Service: ${getServiceName()}
Status: ${getStatusText()}

━━━━━━━━━━━━━━━━━━━━━━
DETAILS
━━━━━━━━━━━━━━━━━━━━━━
`;

      // Add service-specific details to text share
      if (booking.serviceType === 'provincial') {
        receiptText += `
Pickup: ${booking.pickupLocation || 'Not specified'}
Destination: ${booking.destination || 'Not specified'}
Trip Type: ${getTripTypeLabel()}
Vehicle: ${booking.vehicleType || 'Not specified'}
Travel Date: ${formatDate(booking.travelDate)}
Pickup Time: ${booking.pickupTime || 'Flexible'}
Passengers: ${booking.numPassengers || 1}
`;
      } else if (booking.serviceType === 'metro') {
        receiptText += `
Pickup: ${booking.pickupLocation || 'Metro Manila Area'}
Dropoff: ${booking.dropoffLocation || 'Metro Manila Area'}
Vehicle: ${booking.vehicleType || 'Not specified'}
Package: ${booking.package === 'all-inclusive' ? 'All-inclusive' : 'Regular'}
Travel Date: ${formatDate(booking.travelDate)}
Pickup Time: ${booking.pickupTime || 'Flexible'}
Duration: ${booking.duration || 'Not specified'}
`;
      } else if (booking.serviceType === 'airport') {
        receiptText += `
Pickup: ${booking.pickupLocation || 'Not specified'}
Dropoff: ${booking.dropoffLocation || 'Not specified'}
Date: ${formatDate(booking.date)}
Time: ${booking.time || 'Flexible'}
Passengers: ${booking.passengers || 1}
`;
      } else if (booking.serviceType === 'selfdrive') {
        receiptText += `
Vehicle: ${booking.carType || 'Not specified'}
Pickup: ${booking.pickupLocation || 'Not specified'}
Pickup Date: ${formatDate(booking.pickupDate)}
Pickup Time: ${booking.pickupTime || 'Flexible'}
${booking.returnDateTime ? `Return: ${formatDate(booking.returnDateTime)}\n` : ''}
Duration: ${booking.rentalDuration || 'Not specified'}
`;
      }

      receiptText += `
━━━━━━━━━━━━━━━━━━━━━━
PAYMENT
━━━━━━━━━━━━━━━━━━━━━━

Amount: ${formatPrice(booking.amount)}
Payment Method: ${booking.paymentMethod?.toUpperCase() || 'N/A'}
Payment Date: ${formatFullDate(booking.paymentDate)}

━━━━━━━━━━━━━━━━━━━━━━
CONTACT
━━━━━━━━━━━━━━━━━━━━━━

Name: ${booking.clientName}
Email: ${booking.email}
Contact: ${booking.contactNumber}

━━━━━━━━━━━━━━━━━━━━━━
Thank you for choosing OLStar! ✨
      `;
      
      await Share.share({
        message: receiptText,
        title: `OLStar Booking Receipt - ${booking.bookingId}`
      });
      showModal('Receipt shared successfully!', true);
    } catch (error) {
      console.error('Error sharing receipt:', error);
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

  return (
    <SafeAreaView style={styles.container}>
      <AppModal
        visible={modalVisible}
        message={modalMessage}
        isRedirecting={false}
        onClose={() => setModalVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.receiptContainer}>
          <View style={styles.header}>
            <View style={[styles.successIcon, { backgroundColor: getStatusColor() + '20' }]}>
              <Ionicons name="checkmark-circle" size={60} color={getStatusColor()} />
            </View>
            <Text style={styles.title}>Booking {getStatusText() === 'CONFIRMED' ? 'Confirmed! 🎉' : getStatusText()}</Text>
            <Text style={styles.subtitle}>
              {getStatusText() === 'CONFIRMED' 
                ? 'Your booking has been successfully confirmed' 
                : 'Your booking details are shown below'}
            </Text>
          </View>

          <View style={styles.bookingIdCard}>
            <Text style={styles.bookingIdLabel}>BOOKING ID</Text>
            <Text style={styles.bookingIdValue}>{booking.bookingId || booking.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            <View style={styles.detailRow}>
              <Ionicons name="apps-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                {getServiceName()}
              </Text>
            </View>
            {renderServiceSpecificDetails()}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Passenger Details</Text>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.detailText}>{booking.clientName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.detailText}>{booking.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.detailText}>{booking.contactNumber}</Text>
            </View>
            {booking.note && (
              <View style={styles.detailRow}>
                <Ionicons name="document-text-outline" size={20} color="#666" />
                <Text style={styles.detailText} numberOfLines={2}>
                  Note: {booking.note}
                </Text>
              </View>
            )}
          </View>

          {renderAdminUpdates()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total Amount</Text>
              <Text style={styles.priceValue}>{formatPrice(booking.amount)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>{formatPrice(booking.amount)}</Text>
            </View>
            <View style={styles.paymentMethodRow}>
              <Ionicons name="card-outline" size={18} color="#666" />
              <Text style={styles.paymentMethodText}>
                Paid via {booking.paymentMethod?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.paymentDateRow}>
              <Ionicons name="calendar-outline" size={18} color="#666" />
              <Text style={styles.paymentDateText}>
                Paid on: {formatFullDate(booking.timestamp)}
              </Text>
            </View>
          </View>

          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Important Notes 📝</Text>
            <View style={styles.noteItem}>
              <Ionicons name="time-outline" size={16} color="#ff9800" />
              <Text style={styles.noteText}>Please be ready 15 minutes before scheduled time</Text>
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

        <View style={styles.buttonContainer}>
          <Pressable style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#fff" />
            <Text style={styles.shareButtonText}>Share Receipt</Text>
          </Pressable>
        </View>

        <Pressable 
          style={styles.homeButton}
          onPress={() => navigation.navigate('CustomerBookings')}
        >
          <Text style={styles.homeButtonText}>Back to My Bookings</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}