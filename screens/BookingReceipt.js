// screens/BookingReceipt.js
import { View, Text, ScrollView, Pressable, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { styles } from '../styles/BookingReceipt.styles';
import AppModal from '../components/AppModal';

export default function BookingReceipt({ route, navigation }) {
  const { booking } = route.params || {};
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const viewShotRef = useRef(null);

  if (!booking) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff4d4d" />
        <Text style={styles.errorTitle}>No booking found</Text>
        <Text style={styles.errorMessage}>Unable to load booking details</Text>
        <Pressable style={styles.homeButton} onPress={() => navigation.navigate('CustomerHome')}>
          <Text style={styles.homeButtonText}>Go Home</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

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
    // Handle MM-DD-YYYY format
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
    return dateString;
  };

  const getServiceName = () => {
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
      case 'one_way': return 'One-way';
      case 'round_trip': return 'Round Trip';
      case 'tour': return 'Tour';
      default: return booking.tripType;
    }
  };

  const renderServiceSpecificDetails = () => {
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
                Destination: {booking.destination?.name || booking.destination || 'Not specified'}
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
                Vehicle: {booking.selectedVehicleType?.name || 'Not specified'}
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
                Vehicle: {booking.selectedVehicleType?.name || 'Not specified'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="gift-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Package: {booking.packageOption === 'all_in' ? 'All-inclusive' : 'Regular'}
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
                Duration: {booking.selectedDuration?.name || 'Not specified'}
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
                Passengers: {booking.passengerDetails?.numPassengers || 1}
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
                Vehicle: {booking.selectedUnit?.name || 'Not specified'}
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
            {booking.returnDate && (
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  Return: {formatDate(booking.returnDate)}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Ionicons name="hourglass-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                Duration: {booking.selectedDuration?.name || 'Not specified'}
              </Text>
            </View>
          </>
        );

      default:
        return null;
    }
  };

  const handleShare = async () => {
    try {
      let receiptText = `
📋 OLSTAR BOOKING RECEIPT
━━━━━━━━━━━━━━━━━━━━━━

Booking ID: ${booking.bookingId}
Service: ${getServiceName()}
Status: ${booking.paymentStatus?.toUpperCase() || 'CONFIRMED'}

━━━━━━━━━━━━━━━━━━━━━━
DETAILS
━━━━━━━━━━━━━━━━━━━━━━
`;

      // Add service-specific details to text share
      if (booking.serviceType === 'provincial') {
        receiptText += `
Pickup: ${booking.pickupLocation || 'Not specified'}
Destination: ${booking.destination?.name || booking.destination || 'Not specified'}
Trip Type: ${getTripTypeLabel()}
Vehicle: ${booking.selectedVehicleType?.name || 'Not specified'}
Travel Date: ${formatDate(booking.travelDate)}
Pickup Time: ${booking.pickupTime || 'Flexible'}
Passengers: ${booking.numPassengers || 1}
`;
      } else if (booking.serviceType === 'metro') {
        receiptText += `
Pickup: ${booking.pickupLocation || 'Metro Manila Area'}
Dropoff: ${booking.dropoffLocation || 'Metro Manila Area'}
Vehicle: ${booking.selectedVehicleType?.name || 'Not specified'}
Package: ${booking.packageOption === 'all_in' ? 'All-inclusive' : 'Regular'}
Travel Date: ${formatDate(booking.travelDate)}
Pickup Time: ${booking.pickupTime || 'Flexible'}
Duration: ${booking.selectedDuration?.name || 'Not specified'}
Passengers: ${booking.numPassengers || 1}
`;
      } else if (booking.serviceType === 'airport') {
        receiptText += `
Pickup: ${booking.pickupLocation || 'Not specified'}
Dropoff: ${booking.dropoffLocation || 'Not specified'}
Date: ${formatDate(booking.date)}
Time: ${booking.time || 'Flexible'}
Passengers: ${booking.passengerDetails?.numPassengers || 1}
`;
      } else if (booking.serviceType === 'selfdrive') {
        receiptText += `
Vehicle: ${booking.selectedUnit?.name || 'Not specified'}
Pickup: ${booking.pickupLocation || 'Not specified'}
Pickup Date: ${formatDate(booking.pickupDate)}
Pickup Time: ${booking.pickupTime || 'Flexible'}
${booking.returnDate ? `Return: ${formatDate(booking.returnDate)}\n` : ''}
Duration: ${booking.selectedDuration?.name || 'Not specified'}
`;
      }

      receiptText += `
━━━━━━━━━━━━━━━━━━━━━━
PAYMENT
━━━━━━━━━━━━━━━━━━━━━━

Amount: ${formatPrice(booking.price?.final)}
Payment Method: ${booking.paymentMethod?.toUpperCase() || 'N/A'}
Payment Date: ${new Date(booking.paymentDate).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━
CONTACT
━━━━━━━━━━━━━━━━━━━━━━

Name: ${booking.passengerDetails?.fullName}
Email: ${booking.passengerDetails?.email}
Contact: ${booking.passengerDetails?.contactNumber}

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

  const handleDownloadImage = async () => {
    if (!viewShotRef.current) {
      showModal('Unable to capture receipt. Please try again.', false);
      return;
    }

    try {
      setIsGenerating(true);
      
      const uri = await viewShotRef.current.capture();
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Save your receipt',
          UTI: 'image/png'
        });
        showModal('Receipt image ready! You can now save or share it.', true);
      } else {
        await Share.share({
          url: uri,
          title: `OLStar Receipt - ${booking.bookingId}`,
        });
        showModal('Receipt image ready!', true);
      }
    } catch (error) {
      console.error('Error generating receipt image:', error);
      showModal('Failed to generate receipt image. Please try again.', false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppModal
        visible={modalVisible}
        message={modalMessage}
        isRedirecting={false}
        onClose={() => setModalVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <ViewShot 
          ref={viewShotRef}
          options={{ format: 'png', quality: 0.9 }}
          style={styles.receiptContainer}
        >
          <View style={styles.header}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color="#4caf50" />
            </View>
            <Text style={styles.title}>Booking Confirmed! 🎉</Text>
            <Text style={styles.subtitle}>
              Your booking has been successfully confirmed
            </Text>
          </View>

          <View style={styles.bookingIdCard}>
            <Text style={styles.bookingIdLabel}>BOOKING ID</Text>
            <Text style={styles.bookingIdValue}>{booking.bookingId}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>CONFIRMED</Text>
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
              <Text style={styles.detailText}>{booking.passengerDetails?.fullName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.detailText}>{booking.passengerDetails?.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.detailText}>{booking.passengerDetails?.contactNumber}</Text>
            </View>
            {booking.passengerDetails?.note && (
              <View style={styles.detailRow}>
                <Ionicons name="document-text-outline" size={20} color="#666" />
                <Text style={styles.detailText} numberOfLines={2}>
                  Note: {booking.passengerDetails.note}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>{formatPrice(booking.price?.original || booking.price?.final)}</Text>
            </View>
            {booking.price?.discount && (
              <View style={styles.priceRow}>
                <Text style={styles.discountLabel}>Discount</Text>
                <Text style={styles.discountValue}>
                  -{booking.price.discount.type === 'fixed' ? `₱${booking.price.discount.value}` : `${booking.price.discount.value}%`}
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>{formatPrice(booking.price?.final)}</Text>
            </View>
            <View style={styles.paymentMethodRow}>
              <Ionicons name="card-outline" size={18} color="#666" />
              <Text style={styles.paymentMethodText}>
                Paid via {booking.paymentMethod?.toUpperCase()}
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
        </ViewShot>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#fff" />
            <Text style={styles.shareButtonText}>Share as Text</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.downloadButton, isGenerating && styles.downloadButtonDisabled]} 
            onPress={handleDownloadImage}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Ionicons name="refresh-outline" size={20} color="#333" />
                <Text style={styles.downloadButtonText}>Generating...</Text>
              </>
            ) : (
              <>
                <Ionicons name="image-outline" size={20} color="#333" />
                <Text style={styles.downloadButtonText}>Save as Image</Text>
              </>
            )}
          </Pressable>
        </View>

        <Pressable 
          style={styles.homeButton}
          onPress={() => navigation.navigate('CustomerHome')}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}