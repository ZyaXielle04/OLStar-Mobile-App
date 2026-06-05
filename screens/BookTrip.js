// screens/BookTrip.js
import { View, Text, Pressable, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { styles } from '../styles/BookTrip.styles';

// Import reusable forms
import AirportTransferForm1 from '../components/booking/AirportTransferForm1';
import SelfDriveForm1 from '../components/booking/SelfDriveForm1';
import MetroForm1 from '../components/booking/MetroForm1';
import ProvincialForm1 from '../components/booking/ProvincialForm1';
import BookingDosDonts from '../components/booking/BookingDosDonts';
import PaymentPortal from '../components/booking/PaymentPortal';

export default function BookTrip({ route, navigation }) {
  const { openForm } = route.params || {}; // Get the form type from navigation params
  
  const [activeForm, setActiveForm] = useState(openForm || null); // Use openForm if provided
  const [pendingBooking, setPendingBooking] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [savedFormData, setSavedFormData] = useState(null);

  const serviceNames = {
    airport: 'Airport Transfer',
    selfdrive: 'Self Drive',
    metro: 'Metro Manila Driver',
    provincial: 'Provincial Driver',
  };

  // Reset active form when openForm changes
  useEffect(() => {
    if (openForm) {
      setActiveForm(openForm);
      setPendingBooking(null);
      setShowPayment(false);
    }
  }, [openForm]);

  const renderServiceCard = ({ title, description, icon, image, formType }) => {
    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          setSavedFormData(null);
          setActiveForm(formType);
        }}
      >
        <Image source={image} style={styles.cardImage} />
        <View style={styles.cardHeader}>
          <Ionicons name={icon} size={24} color="#ff4d4d" />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardDesc}>{description}</Text>
        <View style={styles.cardButton}>
          <Text style={styles.cardButtonText}>Select</Text>
        </View>
      </Pressable>
    );
  };

  const handlePaymentComplete = (completedBooking) => {
    console.log('Payment completed:', completedBooking);
    // Navigate to receipt screen
    navigation.replace('BookingReceipt', { booking: completedBooking });
  };

  const handleFormSubmit = (bookingData) => {
    const dataWithTimestamp = {
      ...bookingData,
      timestamp: Date.now()
    };
    setSavedFormData(dataWithTimestamp);
    setPendingBooking(bookingData);
  };

  const handleBackFromDosDonts = () => {
    setPendingBooking(null);
  };

  const renderActiveForm = () => {
    if (showPayment && pendingBooking) {
      return (
        <PaymentPortal
          bookingData={pendingBooking}
          onBack={() => setShowPayment(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      );
    }

    if (pendingBooking) {
      return (
        <BookingDosDonts
          key={`dosdonts-${Date.now()}`}
          serviceName={serviceNames[pendingBooking.serviceType] || 'Booking'}
          bookingData={pendingBooking}
          onBack={handleBackFromDosDonts}
          onContinue={() => setShowPayment(true)}
        />
      );
    }

    switch (activeForm) {
      case 'airport':
        return (
          <AirportTransferForm1
            key={`airport-form-${savedFormData?.timestamp || Date.now()}`}
            initialData={savedFormData}
            onBack={() => setActiveForm(null)}
            onBookNow={handleFormSubmit}
          />
        );

      case 'selfdrive':
        return (
          <SelfDriveForm1
            key={`selfdrive-form-${savedFormData?.timestamp || Date.now()}`}
            initialData={savedFormData}
            onBack={() => setActiveForm(null)}
            onBookNow={handleFormSubmit}
          />
        );

      case 'metro':
        return (
          <MetroForm1
            key={`metro-form-${savedFormData?.timestamp || Date.now()}`}
            initialData={savedFormData}
            onBack={() => setActiveForm(null)}
            onBookNow={handleFormSubmit}
          />
        );

      case 'provincial':
        return (
          <ProvincialForm1
            key={`provincial-form-${savedFormData?.timestamp || Date.now()}`}
            initialData={savedFormData}
            onBack={() => setActiveForm(null)}
            onBookNow={handleFormSubmit}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="airplane" size={28} color="#ff4d4d" />
          <Text style={styles.title}>Book a Trip</Text>
        </View>

        {!activeForm && !pendingBooking && !showPayment ? (
          <>
            {renderServiceCard({
              title: 'Airport Transfer',
              description: 'Fast airport pickup and drop-off.',
              icon: 'airplane-outline',
              image: require('../assets/airportTransfer.jpeg'),
              formType: 'airport',
            })}

            {renderServiceCard({
              title: 'Self Drive',
              description: 'Drive your own rental car.',
              icon: 'car-outline',
              image: require('../assets/selfDrive.jpg'),
              formType: 'selfdrive',
            })}

            {renderServiceCard({
              title: 'Metro Manila Driver',
              description: 'Professional driver in Metro Manila.',
              icon: 'person-outline',
              image: require('../assets/metro.png'),
              formType: 'metro',
            })}

            {renderServiceCard({
              title: 'Provincial Driver',
              description: 'Long-distance provincial trips.',
              icon: 'map-outline',
              image: require('../assets/provincial.png'),
              formType: 'provincial',
            })}
          </>
        ) : (
          renderActiveForm()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}