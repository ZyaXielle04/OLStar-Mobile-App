// components/booking/BookingDosDonts.js
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/BookingDosDonts.styles';

// Airport Transfer specific Do's and Don'ts
const airportDos = [
  'Double check your flight number, terminal, and arrival/departure time before confirming.',
  'Make sure the cardholder or wallet account matches the booking name.',
  'Keep your booking ID and the e-receipt for reference on the day of your trip.',
  'Provide accurate dropoff location to ensure smooth transfer.',
  'Be ready at the designated pickup area 15 minutes before scheduled time.',
  'Keep your contact number active for driver coordination.'
];

const airportDonts = [
  "Don't refresh or close the payment window once you've started.",
  "Don't share your one-time PIN, CVV, or password with anyone — even Olstar staff won't ask.",
  "Don't pay through unofficial channels or accounts not linked to Olstar.",
  "Don't book if your flight is unconfirmed — re-book once your itinerary is final.",
  "Don't provide incorrect dropoff location as it may cause delays."
];

// Self Drive specific Do's and Don'ts
const selfDriveDos = [
  'Double check your pickup and dropoff locations before confirming.',
  'Ensure you have a valid driver\'s license and bring it on the day of rental.',
  'Take photos of the vehicle before driving off for your protection.',
  'Fill up the fuel tank to the same level as received to avoid extra charges.',
  'Return the vehicle on time to avoid overtime fees.',
  'Keep your booking ID and contact number handy for assistance.',
  'Inspect the vehicle thoroughly before accepting.'
];

const selfDriveDonts = [
  "Don't refresh or close the payment window once you've started.",
  "Don't share your one-time PIN, CVV, or password with anyone — even Olstar staff won't ask.",
  "Don't pay through unofficial channels or accounts not linked to Olstar.",
  "Don't smoke inside the vehicle (penalties may apply).",
  "Don't exceed the agreed mileage limit (if applicable).",
  "Don't return the vehicle with excessive dirt or damage.",
  "Don't lend the vehicle to unauthorized drivers."
];

// Metro/Manila Car Rental with Driver specific Do's and Don'ts
const metroDos = [
  'Double check your booking details (date, time, vehicle, contact info) before paying.',
  'Make sure the cardholder or e-wallet account matches the booking name.',
  'Keep your booking ID and the e-receipt for reference on the day of your trip.',
  'Pack light and confirm overnight arrangements for the driver if your trip is multi-day.',
  'Share contact numbers with a family member or emergency contact for safety.',
  'Communicate any special requests (e.g., multiple stops) in advance.'
];

const metroDonts = [
  "Don't refresh or close the payment window once you've started.",
  "Don't share your one-time PIN, CVV, or password with anyone — even Olstar staff won't ask.",
  "Don't pay through unofficial channels or accounts not linked to Olstar.",
  "Don't request unreasonable route changes without proper coordination.",
  "Don't pay for stops or fees outside the package without confirming with Olstar support."
];

// Provincial Car Rental with Driver specific Do's and Don'ts
const provincialDos = [
  'Double check your booking details (date, time, vehicle, contact info) before paying.',
  'Make sure the cardholder or e-wallet account matches the booking name.',
  'Keep your booking ID and the e-receipt for reference on the day of your trip.',
  'Pack light and confirm overnight arrangements for the driver if your trip is multi-day.',
  'Share contact numbers with a family member or emergency contact for safety.',
  'Communicate any special requests (e.g., multiple stops) in advance.'
];

const provincialDonts = [
  "Don't refresh or close the payment window once you've started.",
  "Don't share your one-time PIN, CVV, or password with anyone — even Olstar staff won't ask.",
  "Don't pay through unofficial channels or accounts not linked to Olstar.",
  "Don't request unreasonable route changes without proper coordination.",
  "Don't pay for stops or fees outside the package without confirming with Olstar support."
];

// Get the appropriate Do's and Don'ts based on service type
const getDosAndDonts = (serviceType) => {
  switch (serviceType) {
    case 'airport':
    case 'airportTransfer':
      return { dos: airportDos, donts: airportDonts };
    case 'selfdrive':
    case 'selfDriveCarRental':
      return { dos: selfDriveDos, donts: selfDriveDonts };
    case 'metro':
    case 'manilaCarRental':
      return { dos: metroDos, donts: metroDonts };
    case 'provincial':
    case 'provincialCarRental':
      return { dos: provincialDos, donts: provincialDonts };
    default:
      return { 
        dos: airportDos, 
        donts: airportDonts 
      };
  }
};

export default function BookingDosDonts({
  serviceName = 'Booking',
  bookingData,
  dos,
  donts,
  onBack,
  onContinue
}) {
  const [hasAgreed, setHasAgreed] = useState(false);
  const scrollViewRef = useRef(null);
  
  const packageName = bookingData?.selectedPackage?.name || bookingData?.selectedUnit?.name;
  const finalPrice = bookingData?.price?.final;
  const serviceType = bookingData?.serviceType;
  
  // Get the appropriate Do's and Don'ts based on service type if not provided as props
  const { dos: defaultDos, donts: defaultDonts } = getDosAndDonts(serviceType);
  
  const finalDos = dos || defaultDos;
  const finalDonts = donts || defaultDonts;

  // Force scroll to top immediately and after render
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }
    
    const timer1 = setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
      }
    }, 50);
    
    const timer2 = setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
      }
    }, 200);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Also scroll when bookingData changes (new navigation)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [bookingData]);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.container}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        contentContainerStyle={styles.scrollContent}
        initialScrollIndex={0}
        onLayout={() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
          }
        }}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      >
        <View style={styles.header}>
          <Ionicons name="shield-checkmark-outline" size={28} color="#ff4d4d" />
          <Text style={styles.title}>Do's and Don'ts</Text>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>{serviceName}</Text>
          {packageName ? <Text style={styles.summaryText}>Package: {packageName}</Text> : null}
          {finalPrice ? <Text style={styles.summaryText}>Total: ₱{finalPrice}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Do's</Text>
          {finalDos.map((item, index) => (
            <View key={index} style={styles.ruleRow}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#2e7d32" />
              <Text style={styles.ruleText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Don'ts</Text>
          {finalDonts.map((item, index) => (
            <View key={index} style={styles.ruleRow}>
              <Ionicons name="close-circle-outline" size={18} color="#c62828" />
              <Text style={styles.ruleText}>{item}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.agreementRow}
          onPress={() => setHasAgreed(!hasAgreed)}
        >
          <View style={[styles.checkbox, hasAgreed && styles.checkboxChecked]}>
            {hasAgreed && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.agreementText}>
            I have read and agree to the reminders above. I understand I'm about to be redirected to a payment portal.
          </Text>
        </Pressable>

        <Pressable
          style={[styles.continueButton, !hasAgreed && styles.continueButtonDisabled]}
          onPress={onContinue}
          disabled={!hasAgreed}
        >
          <Text style={styles.continueButtonText}>Continue to Payment</Text>
        </Pressable>

        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}