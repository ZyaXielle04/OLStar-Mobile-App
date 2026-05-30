// screens/BookingReceipt.js
import { View, Text, ScrollView, Pressable, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { styles } from '../styles/BookingReceipt.styles';

export default function BookingReceipt({ route, navigation }) {
  const { booking } = route.params || {};
  const [isGenerating, setIsGenerating] = useState(false);
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
    const [month, day, year] = dateString.split('-');
    return `${month}/${day}/${year}`;
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

  const handleShare = async () => {
    try {
      const receiptText = `
📋 OLSTAR BOOKING RECEIPT
━━━━━━━━━━━━━━━━━━━━━━

Booking ID: ${booking.bookingId}
Service: ${getServiceName()}
Status: ${booking.paymentStatus?.toUpperCase() || 'CONFIRMED'}

━━━━━━━━━━━━━━━━━━━━━━
DETAILS
━━━━━━━━━━━━━━━━━━━━━━

Date: ${formatDate(booking.date)}
Time: ${booking.time || 'Flexible'}

Package: ${booking.selectedPackage?.name || 'Standard'}

${booking.pickupLocation ? `Pickup: ${booking.pickupLocation}` : ''}
${booking.dropoffLocation ? `Dropoff: ${booking.dropoffLocation}` : ''}

Passengers: ${booking.passengerDetails?.numPassengers || 1}

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
    } catch (error) {
      console.error('Error sharing receipt:', error);
      Alert.alert('Error', 'Failed to share receipt');
    }
  };

  const handleDownloadImage = async () => {
    if (!viewShotRef.current) {
      Alert.alert('Error', 'Unable to capture receipt');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Capture the view as an image
      const uri = await viewShotRef.current.capture();
      
      // Check if sharing is available
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Save your receipt',
          UTI: 'image/png'
        });
        Alert.alert('Success', 'Receipt image is ready! You can now save or share it.');
      } else {
        // Fallback to regular share
        await Share.share({
          url: uri,
          title: `OLStar Receipt - ${booking.bookingId}`,
        });
      }
    } catch (error) {
      console.error('Error generating receipt image:', error);
      Alert.alert('Error', 'Failed to generate receipt image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* ViewShot wrapper to capture the receipt */}
        <ViewShot 
          ref={viewShotRef}
          options={{ format: 'png', quality: 0.9 }}
          style={styles.receiptContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color="#4caf50" />
            </View>
            <Text style={styles.title}>Booking Confirmed! 🎉</Text>
            <Text style={styles.subtitle}>
              Your booking has been successfully confirmed
            </Text>
          </View>

          {/* Booking ID Card */}
          <View style={styles.bookingIdCard}>
            <Text style={styles.bookingIdLabel}>BOOKING ID</Text>
            <Text style={styles.bookingIdValue}>{booking.bookingId}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>CONFIRMED</Text>
            </View>
          </View>

          {/* Service Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                {formatDate(booking.date)} at {booking.time || 'Flexible Time'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="apps-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                {getServiceName()} - {booking.selectedPackage?.name || 'Standard Package'}
              </Text>
            </View>
            {booking.pickupLocation && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={20} color="#666" />
                <Text style={styles.detailText} numberOfLines={2}>
                  Pickup: {booking.pickupLocation}
                </Text>
              </View>
            )}
            {booking.dropoffLocation && (
              <View style={styles.detailRow}>
                <Ionicons name="navigate-outline" size={20} color="#666" />
                <Text style={styles.detailText} numberOfLines={2}>
                  Dropoff: {booking.dropoffLocation}
                </Text>
              </View>
            )}
          </View>

          {/* Passenger Details */}
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
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                {booking.passengerDetails?.numPassengers} passenger(s)
                {booking.passengerDetails?.numLuggage && `, ${booking.passengerDetails?.numLuggage} luggage(s)`}
              </Text>
            </View>
          </View>

          {/* Payment Summary */}
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

          {/* Important Notes */}
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

        {/* Action Buttons */}
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

        {/* Home Button */}
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