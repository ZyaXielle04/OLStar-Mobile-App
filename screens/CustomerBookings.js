import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles/CustomerBookings.styles';
import BottomNav from '../components/BottomNav';

export default function CustomerBookings() {
  return (
    <SafeAreaView style={styles.safeArea}>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Text style={styles.title}>My Bookings ✈️</Text>
          <Text style={styles.subtitle}>Manage your trips</Text>
        </View>

        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={styles.card}>
            <Text>Booking #{i + 1}</Text>
          </View>
        ))}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}