// screens/CustomerBookings.js
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { styles } from '../styles/CustomerBookings.styles';
import BottomNav from '../components/BottomNav';
import { database } from '../firebaseConfig';
import { ref, onValue, off, query, orderByChild, equalTo } from 'firebase/database';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerBookings({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  // Load user ID from SecureStore
  useEffect(() => {
    loadUserId();
  }, []);

  const loadUserId = async () => {
    try {
      const userSession = await SecureStore.getItemAsync('olstarUser');
      if (userSession) {
        const user = JSON.parse(userSession);
        setUserId(user.uid);
        console.log('✅ User ID loaded:', user.uid);
      } else {
        console.log('❌ No user session found');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user ID:', error);
      setLoading(false);
    }
  };

  // Fetch bookings from Firebase when userId is available
  useEffect(() => {
    if (userId) {
      fetchBookings();
    }
  }, [userId]);

  const fetchBookings = () => {
    if (!userId) return;

    setLoading(true);
    const bookingsRef = ref(database, 'pendingBooking');
    
    // Query to get bookings for this user only
    const userBookingsQuery = query(bookingsRef, orderByChild('clientId'), equalTo(userId));
    
    const unsubscribe = onValue(userBookingsQuery, (snapshot) => {
      if (snapshot.exists()) {
        const bookingsData = snapshot.val();
        const bookingsList = Object.keys(bookingsData).map(key => ({
          id: key,
          ...bookingsData[key]
        })).sort((a, b) => {
          // Sort by bookingId descending (newest first)
          // bookingId format: YYYY-MM-DD-XXXXX
          const idA = a.bookingId || a.id || '';
          const idB = b.bookingId || b.id || '';
          
          // If both have bookingId, sort by that
          if (idA && idB) {
            return idB.localeCompare(idA); // Descending: newest first
          }
          
          // Fallback to timestamp if bookingId is missing
          const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
          const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
          return dateB - dateA;
        });
        
        console.log(`✅ Found ${bookingsList.length} bookings for user`);
        console.log('📋 Sample booking data:', bookingsList[0]);
        setBookings(bookingsList);
      } else {
        console.log('No bookings found for this user');
        setBookings([]);
      }
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching bookings:', error);
      setLoading(false);
      setRefreshing(false);
    });

    return () => off(bookingsRef);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (userId) {
      fetchBookings();
    } else {
      setRefreshing(false);
    }
  }, [userId]);

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

  // Add this function to format vehicle type for display
  const formatVehicleType = (type) => {
    if (!type) return 'Vehicle';
    const types = {
      'sedan': 'Sedan',
      'suv_mpv': 'SUV/MPV',
      'van': 'Van'
    };
    return types[type] || type;
  };

  const getServiceIcon = (bookingType) => {
    switch(bookingType) {
      case 'airportTransfer':
        return 'airplane-outline';
      case 'manilaCarRental':
        return 'car-outline';
      case 'provincialCarRental':
        return 'map-outline';
      case 'selfDriveCarRental':
        return 'car-sport-outline';
      default:
        return 'calendar-outline';
    }
  };

  const getServiceColor = (bookingType) => {
    switch(bookingType) {
      case 'airportTransfer':
        return '#2196f3';
      case 'manilaCarRental':
        return '#ff4d4d';
      case 'provincialCarRental':
        return '#4caf50';
      case 'selfDriveCarRental':
        return '#ff9800';
      default:
        return '#666';
    }
  };

  const getServiceDisplayName = (booking) => {
    const type = booking.bookingType;
    if (type === 'airportTransfer') return 'Airport Transfer';
    if (type === 'manilaCarRental') return 'Metro Manila Car Rental';
    if (type === 'provincialCarRental') return 'Provincial Car Rental';
    if (type === 'selfDriveCarRental') return 'Self Drive Car Rental';
    return 'Car Rental';
  };

  const getBookingSummary = (booking) => {
    const type = booking.bookingType;
    
    if (type === 'airportTransfer') {
      return `${booking.pickup || 'Pickup'} → ${booking.dropoff || 'Dropoff'}`;
    }
    if (type === 'manilaCarRental') {
      // Fix: Format vehicle type for display
      return `${formatVehicleType(booking.vehicleType)} • ${booking.duration || 'Duration'}`;
    }
    if (type === 'provincialCarRental') {
      // Fix: Format vehicle type for display
      return `${booking.destination || 'Destination'} • ${booking.tripType || 'Trip'} • ${formatVehicleType(booking.vehicleType)}`;
    }
    if (type === 'selfDriveCarRental') {
      // Fix: Format car type for display (similar to vehicle type)
      return `${formatVehicleType(booking.carType)} • ${booking.rentalDuration || 'Duration'}`;
    }
    return '';
  };

  const getMainDate = (booking) => {
    const type = booking.bookingType;
    if (type === 'airportTransfer') return booking.date;
    if (type === 'manilaCarRental') return booking.travelDate;
    if (type === 'provincialCarRental') return booking.travelDate;
    if (type === 'selfDriveCarRental') return booking.date;
    return '';
  };

  const getStatusColor = (status) => {
    if (status === 'paid') return '#4caf50';
    if (status === 'pending') return '#ff9800';
    if (status === 'cancelled') return '#f44336';
    if (status === 'completed') return '#2196f3';
    if (status === 'unassigned') return '#ff9800';
    return '#666';
  };

  const getStatusText = (status) => {
    if (status === 'paid') return 'CONFIRMED';
    if (status === 'pending') return 'PENDING';
    if (status === 'cancelled') return 'CANCELLED';
    if (status === 'completed') return 'COMPLETED';
    if (status === 'unassigned') return 'CONFIRMED';
    return status?.toUpperCase() || 'CONFIRMED';
  };

  const handleBookingPress = (booking) => {
    // Navigate to CustomerBookingReceipt with booking data
    navigation.navigate('CustomerBookingReceipt', { 
      bookingId: booking.id,
      booking: booking // Pass the raw booking data for immediate display
    });
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4d4d" />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ff4d4d']} />
        }
      >
        <View style={styles.headerCard}>
          <Text style={styles.title}>My Bookings ✈️</Text>
          <Text style={styles.subtitle}>
            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
          </Text>
        </View>

        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No bookings yet</Text>
            <Text style={styles.emptyStateText}>
              Your bookings will appear here once you make a reservation
            </Text>
          </View>
        ) : (
          bookings.map((booking) => {
            const icon = getServiceIcon(booking.bookingType);
            const iconColor = getServiceColor(booking.bookingType);
            const serviceName = getServiceDisplayName(booking);
            const summary = getBookingSummary(booking);
            const mainDate = getMainDate(booking);
            const statusColor = getStatusColor(booking.paymentStatus || booking.status);
            const statusText = getStatusText(booking.paymentStatus || booking.status);

            return (
              <Pressable
                key={booking.id}
                style={styles.card}
                onPress={() => handleBookingPress(booking)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                    <Ionicons name={icon} size={24} color={iconColor} />
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.serviceName}>{serviceName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#999" />
                    <Text style={styles.detailText}>
                      {formatDate(mainDate) || 'Date not specified'}
                    </Text>
                  </View>
                  
                  {summary && (
                    <View style={styles.detailRow}>
                      <Ionicons name="information-circle-outline" size={16} color="#999" />
                      <Text style={styles.detailText} numberOfLines={1}>
                        {summary}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.price}>{formatPrice(booking.amount)}</Text>
                  <View style={styles.viewDetails}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color="#ff4d4d" />
                  </View>
                </View>
              </Pressable>
            );
          })
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}