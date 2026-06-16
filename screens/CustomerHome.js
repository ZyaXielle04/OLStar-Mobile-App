// screens/CustomerHome.js
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/CustomerHome.styles';
import BottomNav from '../components/BottomNav';
import { database } from '../firebaseConfig';
import { ref, onValue, off, query, orderByChild, equalTo } from 'firebase/database';
import * as SecureStore from 'expo-secure-store';
import * as Localization from 'expo-localization'; // Add this import

export default function CustomerHome({ navigation }) {
  const [userName, setUserName] = useState('Guest');
  const [userFullName, setUserFullName] = useState('');
  const [recentBookings, setRecentBookings] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute to handle timezone changes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchRecentBookings();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      const userSession = await SecureStore.getItemAsync('olstarUser');
      if (userSession) {
        const user = JSON.parse(userSession);
        console.log('📱 Full user data from SecureStore:', user);
        
        let displayName = 'Valued Customer';
        
        if (user.fullName) {
          displayName = user.fullName;
        } else if (user.firstName && user.lastName) {
          displayName = `${user.firstName} ${user.lastName}`;
        } else if (user.firstName) {
          displayName = user.firstName;
        } else if (user.email) {
          displayName = user.email.split('@')[0];
        }
        
        setUserName(displayName);
        setUserFullName(displayName);
        setUserId(user.uid);
        console.log('✅ User name loaded:', displayName);
      } else {
        console.log('❌ No user session found');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const fetchRecentBookings = () => {
    if (!userId) return;
    
    const bookingsRef = ref(database, 'pendingBooking');
    const userBookingsQuery = query(bookingsRef, orderByChild('clientId'), equalTo(userId));
    
    const unsubscribe = onValue(userBookingsQuery, (snapshot) => {
      if (snapshot.exists()) {
        const bookingsData = snapshot.val();
        const bookingsList = Object.keys(bookingsData).map(key => ({
          id: key,
          ...bookingsData[key]
        })).sort((a, b) => {
          const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
          const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
          return dateB - dateA;
        }).slice(0, 3);
        
        setRecentBookings(bookingsList);
        console.log(`✅ Found ${bookingsList.length} recent bookings for user`);
      } else {
        setRecentBookings([]);
        console.log('No bookings found for this user');
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    });

    return () => off(bookingsRef);
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

  // Get greeting based on device's local time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    
    // Use device's locale for timezone-aware greeting
    const userTimeZone = Localization.timezone;
    console.log('User timezone:', userTimeZone);
    
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 18) {
      return 'Good Afternoon';
    } else if (hour >= 18 && hour < 22) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  };

  // Get first name only for greeting (more personal)
  const getFirstName = (fullName) => {
    if (!fullName || fullName === 'Guest' || fullName === 'Valued Customer') return '';
    const firstName = fullName.split(' ')[0];
    return firstName;
  };

  // Format the current time for display (optional)
  const getFormattedTime = () => {
    return currentTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const services = [
    {
      id: 'airportTransfer',
      title: 'Airport Transfer',
      icon: 'airplane-outline',
      color: '#2196f3',
      description: 'Safe & reliable airport pickup/dropoff',
      formType: 'airport'
    },
    {
      id: 'manilaCarRental',
      title: 'Metro Manila Rental',
      icon: 'car-outline',
      color: '#ff4d4d',
      description: 'Car Rental With driver • Metro Manila only',
      formType: 'metro'
    },
    {
      id: 'provincialCarRental',
      title: 'Provincial Rental',
      icon: 'map-outline',
      color: '#4caf50',
      description: 'Car Rental With driver • Anywhere in PH',
      formType: 'provincial'
    },
    {
      id: 'selfDriveCarRental',
      title: 'Self Drive Rental',
      icon: 'car-sport-outline',
      color: '#ff9800',
      description: 'Car Rental Self Drive • Best rates',
      formType: 'selfdrive'
    }
  ];

  const promotions = [
    {
      id: 1,
      title: 'Early Bird Discount',
      description: 'Book 7 days in advance and get 10% off',
      icon: 'time-outline',
      color: '#4caf50'
    },
    {
      id: 2,
      title: 'Group Booking',
      description: 'Book 3+ vehicles and get special rates',
      icon: 'people-outline',
      color: '#2196f3'
    },
    {
      id: 3,
      title: 'Round Trip Special',
      description: 'Save 15% on round trip airport transfers',
      icon: 'repeat-outline',
      color: '#ff9800'
    }
  ];

  const getServiceTypeName = (type) => {
    const names = {
      'airportTransfer': 'Airport Transfer',
      'manilaCarRental': 'Metro Manila Rental',
      'provincialCarRental': 'Provincial Rental',
      'selfDriveCarRental': 'Self Drive Rental'
    };
    return names[type] || 'Car Rental';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return dateString;
  };

  const greeting = getGreeting();
  const firstName = getFirstName(userName);
  const formattedTime = getFormattedTime();
  
  // Create a personalized greeting
  const greetingText = firstName ? `${greeting}, ${firstName}` : `${greeting}!`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.greeting}>{greetingText}</Text>
            <Text style={styles.userName}>{userName}</Text>
            {/* Optional: Show current time */}
            <Text style={styles.currentTime}>{formattedTime}</Text>
          </View>
          <Pressable 
            style={styles.notificationIcon}
            onPress={() => navigation.navigate('CustomerBookings')}
          >
            <Ionicons name="bookmark-outline" size={24} color="#333" />
            {recentBookings.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{recentBookings.length}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Travel with OLStar ✨</Text>
            <Text style={styles.welcomeText}>
              Your trusted partner for safe and reliable transportation anywhere in the Philippines
            </Text>
            <Pressable 
              style={styles.exploreButton}
              onPress={() => navigation.navigate('CustomerBookings')}
            >
              <Text style={styles.exploreButtonText}>View My Bookings</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.welcomeDecoration}>
            <Ionicons name="car-sport" size={80} color="rgba(255,255,255,0.1)" />
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <Text style={styles.sectionSubtitle}>Choose your ride</Text>
          </View>
          
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <Pressable
                key={service.id}
                style={styles.serviceCard}
                onPress={() => {
                  navigation.navigate('BookTrip', { 
                    openForm: service.formType 
                  });
                }}
              >
                <View style={[styles.serviceIcon, { backgroundColor: service.color + '15' }]}>
                  <Ionicons name={service.icon} size={32} color={service.color} />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Promotions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <Text style={styles.sectionSubtitle}>Save more on your next trip</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.promotionsScroll}
          >
            {promotions.map((promo) => (
              <View key={promo.id} style={styles.promoCard}>
                <View style={[styles.promoIcon, { backgroundColor: promo.color + '15' }]}>
                  <Ionicons name={promo.icon} size={28} color={promo.color} />
                </View>
                <Text style={styles.promoTitle}>{promo.title}</Text>
                <Text style={styles.promoDescription}>{promo.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recent Bookings Section */}
        {recentBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Bookings</Text>
              <Pressable onPress={() => navigation.navigate('CustomerBookings')}>
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            </View>
            
            {recentBookings.map((booking) => (
              <Pressable
                key={booking.id}
                style={styles.recentBookingCard}
                onPress={() => navigation.navigate('CustomerBookingReceipt', { bookingId: booking.id, booking: booking })}
              >
                <View style={styles.bookingIcon}>
                  <Ionicons name="calendar-outline" size={24} color="#ff4d4d" />
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingService}>
                    {getServiceTypeName(booking.bookingType)}
                  </Text>
                  <Text style={styles.bookingDate}>
                    {formatDate(booking.travelDate || booking.date)}
                  </Text>
                  <Text style={styles.bookingPrice}>
                    {formatPrice(booking.amount)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </Pressable>
            ))}
          </View>
        )}

        {/* Why Choose Us Section */}
        <View style={styles.whyChooseCard}>
          <Text style={styles.whyChooseTitle}>Why Choose OLStar?</Text>
          <View style={styles.featureGrid}>
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#4caf50" />
              <Text style={styles.featureText}>Safe & Reliable</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="time-outline" size={24} color="#2196f3" />
              <Text style={styles.featureText}>On-Time Promise</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="car-outline" size={24} color="#ff9800" />
              <Text style={styles.featureText}>Well-Maintained Fleet</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="headset-outline" size={24} color="#ff4d4d" />
              <Text style={styles.featureText}>24/7 Support</Text>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}