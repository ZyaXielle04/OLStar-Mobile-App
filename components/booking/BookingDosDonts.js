import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/BookingDosDonts.styles';

const defaultDos = [
  'Double check your booking details (data, time, vehicle, contact info) before paying.',
  'Make sure the cardholder or wallet account matches the booking name.',
  'Keep your booking ID and the e-receipt for reference and on the day of the trip.',
  'Have your flight number, terminal, and arrival/departure time handy in your messages.',
  "Be ready 15 minutes before pickup if you're departing"
];

const defaultDonts = [
  "Don't refresh or close the payment window once you've started.",
  "Don't share your one-time PIN, CVV, or password with anyone — even Olstar staff won't ask.",
  "Don't pay through unofficial channels or accounts not linked to Olstar.",
  "Don't pay if your flight is unconfirmed — re-book once your itinerary is final."
];

export default function BookingDosDonts({
  serviceName = 'Booking',
  bookingData,
  dos = defaultDos,
  donts = defaultDonts,
  onBack,
  onContinue
}) {
  const [hasAgreed, setHasAgreed] = useState(false);
  const packageName = bookingData?.selectedPackage?.name;
  const finalPrice = bookingData?.price?.final;

  return (
    <View style={styles.container}>
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
        {dos.map((item) => (
          <View key={item} style={styles.ruleRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#2e7d32" />
            <Text style={styles.ruleText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Don'ts</Text>
        {donts.map((item) => (
          <View key={item} style={styles.ruleRow}>
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
    </View>
  );
}
